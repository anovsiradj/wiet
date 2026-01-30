export function component(tag, template, config = {}) {
  customElements.define(tag, class extends HTMLElement {
    async connectedCallback() {
      // Load template
      const html = template.startsWith('#') 
        ? document.getElementById(template.slice(1)).innerHTML
        : await fetch(template).then(r => r.text());
      
      // Render
      const root = config.shadow ? this.attachShadow({ mode: 'open' }) : this;
      root.innerHTML = html;
      
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
      config.unmounted?.call(this);
    }
    
    // Expose attributes as properties
    static get observedAttributes() {
      return config.attrs || [];
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
      config.changed?.call(this, name, oldVal, newVal);
    }
  });
}
