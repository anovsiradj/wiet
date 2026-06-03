/**
 * Shared Components
 * Reusable components used across all example pages
 */

import { create, wiet, mixin, wietCreate } from './wiet.js';

// Event Log Component
wiet('event-log', class extends mixin() {
	constructor() {
		super();
		this.template = './widgets/event-log.html';
	}

	mounted() {
		const clearBtn = this.querySelector('.clear-log-btn');
		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				this.clear();
			});
		}
		this._ready = true;
	}
	
	log(message, type = 'info') {
		// Wait for component to be ready
		if (!this._ready) {
			setTimeout(() => this.log(message, type), 10);
			return;
		}
		
		const logContent = this.querySelector('.event-log-content');
		if (!logContent) return;
		const time = new Date().toLocaleTimeString();
		const colors = {
			info: 'text-info',
			success: 'text-success',
			warning: 'text-warning',
			danger: 'text-danger'
		};
		const entry = wietCreate('div', {
			props: { className: colors[type] || 'text-info', textContent: `[${time}] ${message}` }
		});
		logContent.appendChild(entry);
		logContent.scrollTop = logContent.scrollHeight;
	}
	
	clear() {
		const logContent = this.querySelector('.event-log-content');
		if (!logContent) return;
		logContent.innerHTML = '<div class="text-success">Log cleared!</div>';
	}
});

// Example Section Component
wiet('example-section', class extends mixin() {
	static attrs = ['icon', 'title', 'description', 'variant'];
	
	constructor() {
		super();
		this.template = './widgets/example-section.html';
	}

	mounted() {
		this.updateContent();
	}
	
	updateContent() {
		const variant = this.variant || 'primary';
		const alert = this.querySelector('.alert');
		if (!alert) return;
		alert.className = `alert alert-${variant} example-section`;
		
		const icon = this.querySelector('.example-icon');
		if (icon) {
			icon.className = this.icon || 'bi bi-info-circle';
		}
		
		const title = this.querySelector('.example-title');
		if (title) {
			title.textContent = this.title || 'Example';
		}
		const description = this.querySelector('.example-description');
		if (description) {
			description.textContent = this.description || '';
		}
	}
});

// Feature Card Component
wiet('feature-card', class extends mixin() {
	static attrs = ['icon', 'title', 'color'];
    
	constructor() {
		super();
		this.template = './widgets/feature-card.html';
	}

	mounted() {
		this.updateContent();
	}
    
	updateContent() {
		const color = this.color || 'primary';
		const card = this.querySelector('.feature-card');
		if (!card) return;
		card.className = `card feature-card bg-${color} text-white`;
        
		const icon = this.querySelector('.feature-icon');
		if (icon) {
			icon.className = this.icon || 'bi bi-star';
		}
		const title = this.querySelector('.feature-title');
		if (title) {
			title.textContent = this.title || 'Feature';
		}

		// Note: the content/description is provided via the default slot
		// inside the template (see widgets/feature-card.html). Do not
		// overwrite slotted content from an attribute.
	}
});

// Example Card Component
wiet('example-card', class extends mixin() {
	static attrs = ['title', 'icon', 'href', 'variant'];

	constructor() {
		super();
		this.template = './widgets/example-card.html';
	}

	mounted() {
		this.updateContent();
	}

	updateContent() {
		const title = this.querySelector('.example-title');
		if (title) title.textContent = this.title || '';

		const icon = this.querySelector('.example-icon');
		if (icon) icon.className = this.icon || '';

		const link = this.querySelector('.example-link');
		if (link) {
			link.href = this.href || '#';
			const variant = this.variant || 'primary';
			link.className = `btn btn-${variant} w-100 example-link`;
		}
	}
});

