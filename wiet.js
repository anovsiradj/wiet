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

class WietStaticElement extends HTMLElement {
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
    if (templateCache.has(template)) {
      return templateCache.get(template);
    }

    const promise = template.startsWith('#')
      ? Promise.resolve().then(() => {
        const sourceTemplate = document.getElementById(template.slice(1));
        if (!sourceTemplate) {
          throw new Error(`Template "${template}" not found`);
        }
        return sourceTemplate.innerHTML;
      })
      : fetch(template).then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load template "${template}" (${response.status})`);
        }
        return response.text();
      });

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
    if (!slotContent.trim()) return;

    const slots = root.querySelectorAll('slot');
    if (slots.length === 0) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = slotContent;

    slots.forEach(slot => {
      const slotName = slot.getAttribute('name');
      if (slotName) {
        const slottedNodes = tempDiv.querySelectorAll(`[slot="${slotName}"]`);
        this.replaceWithContentOrFallback(slot, slottedNodes);
        return;
      }

      const defaultContent = this.collectDefaultSlotNodes(tempDiv);
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

  runChanged(config, name, oldVal, newVal) {
    if (this._hasRendered) {
      config.changed?.call(this, name, oldVal, newVal);
    }
  }

  logTemplateError(tag, error) {
    console.error(`[wiet] ${tag}: template load error`, error);
  }
}

function wiet(tag, template, config = {}) {
  const existingDefinition = customElements.get(tag);
  if (existingDefinition) {
    return existingDefinition;
  }

  const normalizedAttrs = normalizeAttrs(config.attrs);

  class WietDynamicElement extends WietStaticElement {
    async connectedCallback() {
      if (!this._hasRendered) {
        await this.render(tag, template, config);
      }

      this._isConnected = true;
      config.mounted?.call(this, this._renderRoot);
    }

    disconnectedCallback() {
      this._isConnected = false;
      config.unmounted?.call(this);
    }

    async render(tag, template, config) {
      const renderVersion = this.nextRenderVersion();
      const root = this.resolveRoot(config.shadow);
      const slotContent = config.shadow ? '' : this.innerHTML;

      let html = '';
      try {
        html = await this.loadTemplate(template);
      } catch (error) {
        this.logTemplateError(tag, error);
        return;
      }

      if (this.isRenderStale(renderVersion)) {
        return;
      }

      this._renderRoot = root;
      root.innerHTML = html;

      if (!config.shadow) {
        this.processSlots(root, slotContent);
      }

      this.cleanupEventDelegates();
      this.createEventDelegates(root, config.handles);
      this._hasRendered = true;
    }
  }

  if (config.methods) {
    const descriptors = Object.getOwnPropertyDescriptors(config.methods);
    Object.defineProperties(WietDynamicElement.prototype, descriptors);
  }

  if (config.changed) {
    Object.defineProperty(WietDynamicElement, 'observedAttributes', {
      value: normalizedAttrs.map(entry => entry.attr),
    });

    WietDynamicElement.prototype.attributeChangedCallback = function(name, oldVal, newVal) {
      this.runChanged(config, name, oldVal, newVal);
    };
  }

  normalizedAttrs.forEach(({ attr, prop }) => {
    if (prop in WietDynamicElement.prototype) {
      return;
    }

    Object.defineProperty(WietDynamicElement.prototype, prop, {
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
  });

  customElements.define(tag, WietDynamicElement);
  return WietDynamicElement;
}

function make(tagName, config) {
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

export {
  make,
  wiet,
  WietStaticElement,
}
