export function component(tag, template, config = {}) {
  class ComponentClass extends HTMLElement {
    constructor() {
      super();
      this._isConnected = false;
    }
    
    async connectedCallback() {
      // Load template
      const html = template.startsWith('#') 
        ? document.getElementById(template.slice(1)).innerHTML
        : await fetch(template).then(r => r.text());
      
      // Render
      const root = config.shadow ? this.attachShadow({ mode: 'open' }) : this;
      root.innerHTML = html;
      
      // Mark as connected
      this._isConnected = true;
      
      // Bind events
      if (config.on) {
        Object.entries(config.on).forEach(([selector, events]) => {
          Object.entries(events).forEach(([event, handler]) => {
            root.querySelectorAll(selector).forEach(el => {
              el.addEventListener(event, handler.bind(this));
            });
          });
        });
      }
      
      // Lifecycle
      config.mounted?.call(this, root);
    }
    
    disconnectedCallback() {
      this._isConnected = false;
      config.unmounted?.call(this);
    }
    
    // Expose attributes as properties
    static get observedAttributes() {
      return config.attrs || [];
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
      // Only call changed callback after component is connected and rendered
      if (this._isConnected) {
        config.changed?.call(this, name, oldVal, newVal);
      }
    }
  }
  
  // Add custom methods if provided
  if (config.methods) {
    Object.assign(ComponentClass.prototype, config.methods);
  }
  
  customElements.define(tag, ComponentClass);
  return ComponentClass;
}