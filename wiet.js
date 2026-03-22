/**
 * Wiet
 * A minimal, dynamic factory for creating web components
 * 
 * Features:
 * - Template or external HTML files
 * - Shadow DOM support
 * - Slot support (default and named)
 * - Event binding
 * - Lifecycle hooks
 * - Reactive attributes
 * - Custom methods
 */

class WietStaticElement extends HTMLElement {
  constructor() {
    super();
    this._isConnected = false;
    this._renderVersion = 0;
  }

  nextRenderVersion() {
    this._renderVersion += 1;
    return this._renderVersion;
  }

  isRenderStale(renderVersion) {
    return renderVersion !== this._renderVersion || !this.isConnected;
  }

  markConnected() {
    this._isConnected = true;
  }

  markDisconnected() {
    this._isConnected = false;
  }

  async loadTemplate(template) {
    if (template.startsWith('#')) {
      const sourceTemplate = document.getElementById(template.slice(1));
      if (!sourceTemplate) {
        throw new Error(`Template "${template}" not found`);
      }
      return sourceTemplate.innerHTML;
    }

    const response = await fetch(template);
    if (!response.ok) {
      throw new Error(`Failed to load template "${template}" (${response.status})`);
    }
    return response.text();
  }

  resolveRoot(useShadow) {
    return useShadow
      ? (this.shadowRoot || this.attachShadow({ mode: 'open' }))
      : this;
  }

  processSlots(root, slotContent) {
    if (!slotContent.trim()) return;

    const slots = root.querySelectorAll('slot');
    if (slots.length === 0) return;

    // Create a temporary container to parse slot content
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
      if (node.nodeType === 1) return !node.hasAttribute('slot');
      return node.nodeType === 3 && node.textContent.trim();
    });
  }

  replaceWithContentOrFallback(slot, nodes) {
    if (nodes.length > 0) {
      const fragment = document.createDocumentFragment();
      nodes.forEach(node => {
        const cloned = node.cloneNode(true);
        if (cloned.nodeType === 1) {
          cloned.removeAttribute('slot');
        }
        fragment.appendChild(cloned);
      });
      slot.replaceWith(fragment);
      return;
    }

    // Keep default content if no matching content provided
    const fallback = slot.innerHTML;
    if (fallback.trim()) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = fallback;
      slot.replaceWith(wrapper);
    }
  }

  bindConfiguredEvents(root, eventsMap, thisArg = this) {
    if (!eventsMap) return;
    Object.entries(eventsMap).forEach(([selector, events]) => {
      Object.entries(events).forEach(([event, handler]) => {
        root.querySelectorAll(selector).forEach(el => {
          el.addEventListener(event, handler.bind(thisArg));
        });
      });
    });
  }

  runChanged(config, name, oldVal, newVal) {
    if (this._isConnected) {
      config.changed?.call(this, name, oldVal, newVal);
    }
  }

  logTemplateError(tag, error) {
    console.error(`[wiet] ${tag}: template load error`, error);
  }
}

function wiet(tag, template, config = {}) {
  class WietDynamicElement extends WietStaticElement {
    async connectedCallback() {
      const renderVersion = this.nextRenderVersion();

      // Save slot content before replacing innerHTML
      const slotContent = this.innerHTML;

      // Load template
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

      // Render
      const root = this.resolveRoot(config.shadow);
      root.innerHTML = html;

      this.processSlots(root, slotContent);

      // Mark as connected
      this.markConnected();

      // Bind events
      this.bindConfiguredEvents(root, config.handles);

      // Lifecycle
      config.mounted?.call(this, root);
    }

    disconnectedCallback() {
      this.markDisconnected();
      config.unmounted?.call(this);
    }

    // Expose attributes as properties
    static get observedAttributes() {
      return config.attrs || [];
    }

    attributeChangedCallback(name, oldVal, newVal) {
      this.runChanged(config, name, oldVal, newVal);
    }
  }

  // Add custom methods if provided
  if (config.methods) {
    Object.assign(WietDynamicElement.prototype, config.methods);
  }

  const existingDefinition = customElements.get(tag);
  if (existingDefinition) {
    return existingDefinition;
  }

  customElements.define(tag, WietDynamicElement);
  return WietDynamicElement;
}

function make(tagName, config) {
  config ??= {}
  config = {
    createOptions: {},
    attrs: {},
    props: {},
    handle: (element) => element,
    ...config,
  }
  let element = document.createElement(tagName, config.createOptions)

  for (let attr in config.attrs) {
    element.setAttribute(attr, config.attrs[attr])
  }
  for (let prop in config.props) {
    element[prop] = config.props[prop]
  }

  return config.handle(element)
}

export {
  make,
  wiet,
  WietStaticElement,
}