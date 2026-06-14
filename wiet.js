/**
 * Wiet - Tiny, standards-first Web Component factory
 *
 * Features:
 * - Inline and external templates
 * - Shadow DOM support
 * - Native event delegation
 * - Lifecycle hooks
 * - Observed attributes
 * - Custom prototype methods
 */

// Core utilities
const templateCache = new Map();

const attrNameToProp = attr => attr.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());

const normalizeAttrs = attrs => {
	if (!Array.isArray(attrs)) return [];
	return attrs.map(entry => {
		if (typeof entry === 'string') {
			return { attr: entry, prop: attrNameToProp(entry) };
		}

		const attr = entry.attr || entry.name;
		if (!attr) return null;
		return {
			attr,
			prop: entry.prop || entry.property || attrNameToProp(attr),
		};
	}).filter(Boolean);
};

// Event delegation utilities
function createEventDelegates(root, eventsMap, thisArg = this) {
	if (!eventsMap) return;

	try {
		const grouped = new Map();
		Object.entries(eventsMap).forEach(([selector, events]) => {
			Object.entries(events || {}).forEach(([type, handler]) => {
				if (typeof handler !== 'function') return;
				if (!grouped.has(type)) {
					grouped.set(type, []);
				}
				grouped.get(type).push({ selector, handler });
			});
		});

		grouped.forEach((handlers, type) => {
			const listener = event => {
				try {
					const target = event.target;
					handlers.forEach(({ selector, handler }) => {
						try {
							const match = target.closest(selector);
							if (match && root.contains(match)) {
								handler.call(thisArg, event);
							}
						} catch (error) {
							console.error(`[wiet] ${this.tagName.toLowerCase()}: handler for "${selector}" error`, error);
						}
					});
				} catch (error) {
					console.error(`[wiet] ${this.tagName.toLowerCase()}: event listener error`, error);
				}
			};

			root.addEventListener(type, listener);
			this._eventDelegates.push({ root, type, listener });
		});
	} catch (error) {
		console.error(`[wiet] ${this.tagName.toLowerCase()}: createEventDelegates error`, error);
	}
}

function cleanupEventDelegates() {
	try {
		this._eventDelegates.forEach(({ root, type, listener }) => {
			root.removeEventListener(type, listener);
		});
		this._eventDelegates.length = 0;
	} catch (error) {
		console.error(`[wiet] ${this.tagName.toLowerCase()}: cleanup error`, error);
	}
}

// Template loading
async function loadTemplate(template) {
	if (templateCache.has(template)) {
		return templateCache.get(template);
	}

	const promise = (async () => {
		try {
			if (template.startsWith('#')) {
				const source = document.getElementById(template.slice(1));
				if (!source) {
					throw new Error(`Template "${template}" not found`);
				}

				if (source.tagName && source.tagName.toLowerCase() === 'template') {
					return source;
				}

				const t = document.createElement('template');
				t.innerHTML = source.innerHTML;
				return t;
			}

			const resp = await fetch(template);
			if (!resp.ok) {
				throw new Error(`Failed to load template "${template}" (${resp.status})`);
			}
			const text = await resp.text();

			const t = document.createElement('template');
			t.innerHTML = text;
			return t;
		} catch (error) {
			console.error(`[wiet] template load error for "${template}"`, error);
			throw error;
		}
	})();

	templateCache.set(template, promise);
	return promise;
}

// Slot processing
function processSlots(root, slotContent) {
	if (!slotContent || !slotContent.trim()) return;

	const slots = root.querySelectorAll('slot');
	if (slots.length === 0) return;

	try {
		const tempTemplate = document.createElement('template');
		tempTemplate.innerHTML = slotContent;
		const tempRoot = tempTemplate.content;

		slots.forEach(slot => {
			const slotName = slot.getAttribute('name');
			if (slotName) {
				const slottedNodes = tempRoot.querySelectorAll(`[slot="${slotName}"]`);
				replaceWithContentOrFallback(slot, Array.from(slottedNodes));
				return;
			}

			const defaultContent = Array.from(tempRoot.childNodes).filter(node => {
				if (node.nodeType === Node.ELEMENT_NODE) return !node.hasAttribute('slot');
				return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
			});
			replaceWithContentOrFallback(slot, defaultContent);
		});
	} catch (error) {
		console.error(`[wiet] ${this.tagName.toLowerCase()}: slot processing error`, error);
	}
}

function replaceWithContentOrFallback(slot, nodes) {
	try {
		if (nodes.length > 0) {
			const fragment = document.createDocumentFragment();
			nodes.forEach(node => {
				const cloned = node.cloneNode(true);
				if (cloned.nodeType === Node.ELEMENT_NODE) {
					cloned.removeAttribute('slot');
				}
				fragment.appendChild(cloned);
			});
			slot.replaceWith(fragment);
			return;
		}

		const fallback = slot.innerHTML;
		if (fallback.trim()) {
			const wrapper = document.createElement('span');
			wrapper.innerHTML = fallback;
			slot.replaceWith(wrapper);
		}
	} catch (error) {
		console.error(`[wiet] ${this.tagName.toLowerCase()}: slot replacement error`, error);
	}
}

// Main WietClass
const WietClass = (ElemClass = HTMLElement) => class extends ElemClass {
	constructor() {
		super();
		this._hasRendered = false;
		this._renderVersion = 0;
		this._renderRoot = null;
		this._eventDelegates = [];
		this._originalSlotContent = null;
		this.loadTemplate = loadTemplate;
		this.processSlots = processSlots;
		this.cleanupEventDelegates = cleanupEventDelegates;
		this.createEventDelegates = createEventDelegates;
		this.replaceWithContentOrFallback = replaceWithContentOrFallback;

		this.shadowEnable = false
		this.shadowConfig = {
			mode: 'open',
		}
	}

	nextRenderVersion() {
		return ++this._renderVersion;
	}

	isRenderStale(renderVersion) {
		return renderVersion !== this._renderVersion;
	}

	async _renderTemplate() {
		const renderVersion = this.nextRenderVersion();
		const root = this.resolvedRoot;

		let slotContent = '';
		if (!this._hasRendered && !this.shadowEnable) {
			this._originalSlotContent = this.innerHTML;
			slotContent = this._originalSlotContent;
		} else if (!this.shadowEnable) {
			slotContent = this._originalSlotContent || '';
		}

		let templateEl = null;
		if (this.template) {
			try {
				templateEl = await this.loadTemplate(this.template);
			} catch (error) {
				return;
			}
		}

		if (this.isRenderStale(renderVersion)) {
			return;
		}

		this._renderRoot = root;
		if (this.template && templateEl) {
			while (root.firstChild) root.removeChild(root.firstChild);
			root.appendChild(templateEl.content.cloneNode(true));
		}

		if (!this.shadowEnable && this.template && slotContent) {
			this.processSlots(root, slotContent);
		}

		this.cleanupEventDelegates();
		if (this.handles) {
			this.createEventDelegates(root, this.handles);
		}

		this._hasRendered = true;
	}

	get resolvedRoot() {
		if (this.shadowEnable) {
			if (!this.shadowRoot) {
				this.attachShadow(this.shadowConfig);
			}
			return this.shadowRoot;
		}
		return this;
	}

	async connectedCallback() {
		if (!this._hasRendered) {
			try {
				await this._renderTemplate();

				if (typeof this.render === 'function' && this.render !== this._renderTemplate) {
					try {
						const maybePromise = this.render();
						if (maybePromise && typeof maybePromise.then === 'function') {
							await maybePromise;
						}
					} catch (err) {
						console.error(`[wiet] ${this.tagName.toLowerCase()}: render() error`, err);
					}
				}
			} catch (error) {
				console.error(`[wiet] ${this.tagName.toLowerCase()}: connectedCallback error`, error);
			}
		}

		try {
			this.mounted?.(this._renderRoot);
		} catch (error) {
			console.error(`[wiet] ${this.tagName.toLowerCase()}: mounted() error`, error);
		}
	}

	disconnectedCallback() {
		try {
			this.unmounted?.();
		} catch (error) {
			console.error(`[wiet] ${this.tagName.toLowerCase()}: unmounted() error`, error);
		}
		this.cleanupEventDelegates();
	}

	attributeChangedCallback(name, oldVal, newVal) {
		this.runChanged(name, oldVal, newVal);
	}

	runChanged(name, oldVal, newVal) {
		if (this._hasRendered) {
			try {
				this.changed?.(name, oldVal, newVal);
			} catch (error) {
				console.error(`[wiet] ${this.tagName.toLowerCase()}: changed() callback error`, error);
			}
		}
	}
};

// Public API
function wietDefine(config, WidgetClass) {
	let tname = null;
	let options = {};

	if (typeof config === 'object') {
		({ tname, ...options } = config);
	}
	if (typeof config === 'string') {
		tname = config;
	}

	if (WidgetClass.attrs) {
		const normalizedAttrs = normalizeAttrs(WidgetClass.attrs);

		if (!Object.getOwnPropertyDescriptor(WidgetClass, 'observedAttributes')) {
			Object.defineProperty(WidgetClass, 'observedAttributes', {
				get() {
					return normalizedAttrs.map(entry => entry.attr);
				},
				configurable: true,
				enumerable: true
			});
		}

		normalizedAttrs.forEach(({ attr, prop }) => {
			if (!(prop in WidgetClass.prototype)) {
				Object.defineProperty(WidgetClass.prototype, prop, {
					get() {
						return this.getAttribute(attr);
					},
					set(value) {
						if (value == null) {
							this.removeAttribute(attr);
						} else {
							this.setAttribute(attr, String(value));
						}
					},
					configurable: true,
					enumerable: true,
				});
			}
		});
	}

	customElements.define(tname, WidgetClass, options);

	return WidgetClass;
}

function wietCreate(tname, config) {
	config ??= {};
	config = {
		options: {},
		attrs: {},
		props: {},
		handle: (element) => element,
		...config,
	};

	const element = document.createElement(tname, config.options);

	for (const attr in config.attrs) {
		element.setAttribute(attr, config.attrs[attr]);
	}

	for (const prop in config.props) {
		element[prop] = config.props[prop];
	}

	return config.handle(element);
}

export {
	WietClass,
	wietDefine,
	wietCreate,
};
