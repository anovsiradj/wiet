/**
 * Wiet
 * A minimal, standards-friendly web component factory
 * 
 * Features:
 * - Inline and external templates
 * - Shadow DOM support
 * - Native event delegation
 * - Lifecycle hooks
 * - Observed attributes
 * - Custom prototype methods
 */

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

export function wiet(tag, ComponentClass, options = {}) {
  if (ComponentClass.attrs) {
    const normalizedAttrs = normalizeAttrs(ComponentClass.attrs);

    if (!Object.getOwnPropertyDescriptor(ComponentClass, 'observedAttributes')) {
      Object.defineProperty(ComponentClass, 'observedAttributes', {
        get() {
          return normalizedAttrs.map(entry => entry.attr);
        },
        configurable: true,
        enumerable: true
      });
    }

    normalizedAttrs.forEach(({ attr, prop }) => {
      if (!(prop in ComponentClass.prototype)) {
        Object.defineProperty(ComponentClass.prototype, prop, {
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

  if (typeof tag === 'object' && tag.extends) {
    customElements.define(tag.name, ComponentClass, { extends: tag.extends });
  } else {
    customElements.define(tag, ComponentClass, options);
  }

  return ComponentClass;
}

const mixin = (Base = HTMLElement) => class extends Base {
  constructor() {
    super();
    this._isConnected = false;
    this._hasRendered = false;
    this._renderVersion = 0;
    this._renderRoot = null;
    this._eventDelegates = [];
  }

  nextRenderVersion() {
    return ++this._renderVersion;
  }

  isRenderStale(renderVersion) {
    return renderVersion !== this._renderVersion;
  }

  resolveRoot(useShadow) {
    if (useShadow) {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
      return this.shadowRoot;
    }

    return this;
  }

  async loadTemplate(template) {
    // Cache promises resolving to an HTMLTemplateElement
    if (templateCache.has(template)) {
      return templateCache.get(template);
    }

    const promise = (async () => {
      if (template.startsWith('#')) {
        const source = document.getElementById(template.slice(1));
        if (!source) {
          throw new Error(`Template "${template}" not found`);
        }

        // If the source is already a <template>, reuse it; otherwise wrap its
        // innerHTML in a new <template> so we can clone its `.content` later.
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
    })();

    templateCache.set(template, promise);
    return promise;
  }

  createEventDelegates(root, eventsMap, thisArg = this) {
    if (!eventsMap) return;

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
        const target = event.target;
        handlers.forEach(({ selector, handler }) => {
          const match = target.closest(selector);
          if (match && root.contains(match)) {
            handler.call(thisArg, event);
          }
        });
      };

      root.addEventListener(type, listener);
      this._eventDelegates.push({ root, type, listener });
    });
  }

  cleanupEventDelegates() {
    this._eventDelegates.forEach(({ root, type, listener }) => {
      root.removeEventListener(type, listener);
    });
    this._eventDelegates.length = 0;
  }

  processSlots(root, slotContent) {
    if (!slotContent || !slotContent.trim()) return;

    const slots = root.querySelectorAll('slot');
    if (slots.length === 0) return;

    // Parse slot content using a <template> so the browser does the HTML parsing
    // and we can work with a DocumentFragment rather than an element hack.
    const tempTemplate = document.createElement('template');
    tempTemplate.innerHTML = slotContent;
    const tempRoot = tempTemplate.content;

    slots.forEach(slot => {
      const slotName = slot.getAttribute('name');
      if (slotName) {
        const slottedNodes = tempRoot.querySelectorAll(`[slot="${slotName}"]`);
        this.replaceWithContentOrFallback(slot, slottedNodes);
        return;
      }

      const defaultContent = this.collectDefaultSlotNodes(tempRoot);
      this.replaceWithContentOrFallback(slot, defaultContent);
    });
  }

  collectDefaultSlotNodes(tempDiv) {
    return Array.from(tempDiv.childNodes).filter(node => {
      if (node.nodeType === Node.ELEMENT_NODE) return !node.hasAttribute('slot');
      return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
    });
  }

  replaceWithContentOrFallback(slot, nodes) {
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
  }

  runChanged(name, oldVal, newVal) {
    if (this._hasRendered) {
      this.changed?.(name, oldVal, newVal);
    }
  }

  logTemplateError(tag, error) {
    console.error(`[wiet] ${tag}: template load error`, error);
  }

  // --- Standard Lifecycle Hooks ---

  async connectedCallback() {
    if (!this._hasRendered) {
      // Render the template/content managed by the mixin (non-overridable)
      await this._renderTemplate();

      // If the component defines its own `render` method (for updating
      // content inside the already-inserted template), call it now. This
      // avoids child classes accidentally overriding the mixin's template
      // loader by defining `render`.
      if (typeof this.render === 'function' && this.render !== this._renderTemplate) {
        try {
          const maybePromise = this.render();
          if (maybePromise && typeof maybePromise.then === 'function') {
            await maybePromise;
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    this._isConnected = true;
    this.mounted?.(this._renderRoot);
  }

  disconnectedCallback() {
    this._isConnected = false;
    this.unmounted?.();
    this.cleanupEventDelegates();
  }

  adoptedCallback() {
    this.adopted?.();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this.runChanged(name, oldVal, newVal);
  }

  // --- Rendering ---

  async _renderTemplate() {
    const renderVersion = this.nextRenderVersion();
    const root = this.resolveRoot(this.useShadow);
    const slotContent = this.useShadow ? '' : this.innerHTML;

    let templateEl = null;
    if (this.template) {
      try {
        templateEl = await this.loadTemplate(this.template);
      } catch (error) {
        this.logTemplateError(this.tagName.toLowerCase(), error);
        return;
      }
    }

    if (this.isRenderStale(renderVersion)) {
      return;
    }

    this._renderRoot = root;
    if (this.template && templateEl) {
      // Clear existing content and append a cloned parsed template
      while (root.firstChild) root.removeChild(root.firstChild);
      root.appendChild(templateEl.content.cloneNode(true));
    }

    if (!this.useShadow && this.template) {
      this.processSlots(root, slotContent);
    }

    this.cleanupEventDelegates();
    if (this.handles) {
      this.createEventDelegates(root, this.handles);
    }
    
    this._hasRendered = true;
  }
};

export function create(tagName, config) {
  config ??= {};
  config = {
    createOptions: {},
    attrs: {},
    props: {},
    handle: (element) => element,
    ...config,
  };

  const element = document.createElement(tagName, config.createOptions);

  for (const attr in config.attrs) {
    element.setAttribute(attr, config.attrs[attr]);
  }

  for (const prop in config.props) {
    element[prop] = config.props[prop];
  }

  return config.handle(element);
}

export { mixin };
