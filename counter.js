// 1. Create a reusable template to avoid re-parsing HTML on every instance
/*
const template = document.createElement('template');
template.innerHTML = '...'
*/
const template = document.getElementById('counter-template')

// 2. Define the element's logic by extending the base HTMLElement class
class Counter extends HTMLElement {
	// Define which attributes to watch for changes
	static get observedAttributes() {
		return ['initial-value'];
	}

	constructor() {
		super(); // Mandatory first step to establish the prototype chain

		// Attach an enclosed Shadow DOM tree to protect internal styles and markup
		this.attachShadow({ mode: 'open' });
		
		// Clone and append the reusable template content into the shadow root
		// this.shadowRoot.appendChild(template.content.cloneNode(true));
		
		this.shadowRoot.appendChild(document.importNode(template.content, true));

		// Initialize internal component state
		this._count = 0;
		
		// Cache internal DOM element references for efficient updates
		this.$count = this.shadowRoot.querySelector('#count');
		this.$incButton = this.shadowRoot.querySelector('#inc');
		this.$decButton = this.shadowRoot.querySelector('#dec');
	}

	// Lifecycle Hook: Triggered when the element enters the document DOM
	connectedCallback() {
		this.$incButton.addEventListener('click', this._increment);
		this.$decButton.addEventListener('click', this._decrement);
		this._render();
	}

	// Lifecycle Hook: Triggered when the element leaves the document DOM
	disconnectedCallback() {
		this.$incButton.removeEventListener('click', this._increment);
		this.$decButton.removeEventListener('click', this._decrement);
	}

	// Lifecycle Hook: Triggered when observed attributes change
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'initial-value' && oldValue !== newValue) {
			this._count = parseInt(newValue, 10) || 0;
			this._render();
		}
	}

	// Component logic with arrow functions to maintain correct execution context
	_increment = () => {
		this._count++;
		this._render();
		this._dispatchChangeEvent();
	};

	_decrement = () => {
		this._count--;
		this._render();
		this._dispatchChangeEvent();
	};

	// Update visual elements directly based on the state change
	_render() {
		this.$count.textContent = this._count;
	}

	// Emit a native Custom Event so parent frameworks or scripts can listen to it
	_dispatchChangeEvent() {
		this.dispatchEvent(new CustomEvent('counter-change', {
			detail: { value: this._count },
			bubbles: true,
			composed: true // Allows the event to pass through the Shadow DOM boundary
		}));
	}
}

// 3. Register the custom tag name with the browser
// The tag name must contain a hyphen to protect standard HTML namespaces
customElements.define('wiet-counter', Counter);
