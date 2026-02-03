export function component(tag, template, config = {}) {
  class ComponentClass extends HTMLElement {
    constructor() {
      super();
      this._isConnected = false;
    }
    
    async connectedCallback() {
      // Save slot content before replacing innerHTML
      // const slotContent = this.innerHTML;
      
      // Load template
      const html = template.startsWith('#') 
        ? document.getElementById(template.slice(1)).innerHTML
        : await fetch(template).then(r => r.text());
      
      // Render
      const root = config.shadow ? this.attachShadow({ mode: 'open' }) : this;
      root.innerHTML = html;
      
      /*
      // Process slots
      if (slotContent.trim()) {
        const slots = root.querySelectorAll('slot');
        
        if (slots.length > 0) {
          // Create a temporary container to parse slot content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = slotContent;
          
          slots.forEach(slot => {
            const slotName = slot.getAttribute('name');
            
            if (slotName) {
              // Named slot: find matching content
              const slotted = tempDiv.querySelector(`[slot="${slotName}"]`);
              if (slotted) {
                slot.replaceWith(slotted.cloneNode(true));
              } else {
                // Keep default content if no matching slot provided
                const defaultContent = slot.innerHTML;
                if (defaultContent.trim()) {
                  const wrapper = document.createElement('span');
                  wrapper.innerHTML = defaultContent;
                  slot.replaceWith(wrapper);
                }
              }
            } else {
              // Default slot: insert all non-slotted content
              const defaultContent = Array.from(tempDiv.childNodes)
                .filter(node => {
                  if (node.nodeType === 1) { // Element node
                    return !node.hasAttribute('slot');
                  }
                  return node.nodeType === 3 && node.textContent.trim(); // Text node
                });
              
              if (defaultContent.length > 0) {
                const fragment = document.createDocumentFragment();
                defaultContent.forEach(node => fragment.appendChild(node.cloneNode(true)));
                slot.replaceWith(fragment);
              } else {
                // Keep default content if no content provided
                const defaultSlotContent = slot.innerHTML;
                if (defaultSlotContent.trim()) {
                  const wrapper = document.createElement('span');
                  wrapper.innerHTML = defaultSlotContent;
                  slot.replaceWith(wrapper);
                }
              }
            }
          });
        }
      }
      */
      
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
