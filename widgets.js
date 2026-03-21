/**
 * Shared Components
 * Reusable components used across all example pages
 */

import { wiet } from './wiet.js';

// Page Header Component
wiet('page-header', './widgets/page-header.html', {
	mounted() {
		// Setup theme toggle
		const toggleBtn = this.querySelector('.theme-toggle');
		const html = document.documentElement;
		if (!toggleBtn) return;
		
		toggleBtn.addEventListener('click', () => {
			const currentTheme = html.getAttribute('data-bs-theme');
			const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
			html.setAttribute('data-bs-theme', newTheme);
			
			const icon = toggleBtn.querySelector('i');
			if (icon) {
				icon.className = newTheme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun-fill';
			}
		});
	}
});

// Event Log Component
wiet('event-log', './widgets/event-log.html', {
	mounted() {
		const clearBtn = this.querySelector('.clear-log-btn');
		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				this.clear();
			});
		}
		this._ready = true;
	},
	
	methods: {
		log(message, type = 'info') {
			// Wait for component to be ready
			if (!this._ready) {
				setTimeout(() => this.log(message, type), 10);
				return;
			}
			
			const logContent = this.querySelector('.event-log-content');
			if (!logContent) return;
			const entry = document.createElement('div');
			const time = new Date().toLocaleTimeString();
			const colors = {
				info: 'text-info',
				success: 'text-success',
				warning: 'text-warning',
				danger: 'text-danger'
			};
			entry.className = colors[type] || 'text-info';
			entry.textContent = `[${time}] ${message}`;
			logContent.appendChild(entry);
			logContent.scrollTop = logContent.scrollHeight;
		},
		
		clear() {
			const logContent = this.querySelector('.event-log-content');
			if (!logContent) return;
			logContent.innerHTML = '<div class="text-success">Log cleared!</div>';
		}
	}
});

// Example Section Component
wiet('example-section', './widgets/example-section.html', {
	attrs: ['icon', 'title', 'description', 'variant'],
	
	mounted() {
		this.updateContent();
	},

	changed() {
		this.updateContent();
	},
	
	methods: {
		updateContent() {
			const variant = this.getAttribute('variant') || 'primary';
			const alert = this.querySelector('.alert');
			if (!alert) return;
			alert.className = `alert alert-${variant} example-section`;
			
			const icon = this.querySelector('.example-icon');
			if (icon) {
				icon.className = this.getAttribute('icon') || 'bi bi-info-circle';
			}
			
			const title = this.querySelector('.example-title');
			if (title) {
				title.textContent = this.getAttribute('title') || 'Example';
			}
			const description = this.querySelector('.example-description');
			if (description) {
				description.textContent = this.getAttribute('description') || '';
			}
		}
	}
});

// Feature Card Component
wiet('feature-card', './widgets/feature-card.html', {
	attrs: ['icon', 'title', 'description', 'color'],
	
	mounted() {
		this.updateContent();
	},

	changed() {
		this.updateContent();
	},
	
	methods: {
		updateContent() {
			const color = this.getAttribute('color') || 'primary';
			const card = this.querySelector('.feature-card');
			if (!card) return;
			card.className = `card feature-card bg-${color} text-white`;
			
			const icon = this.querySelector('.feature-icon');
			if (icon) {
				icon.className = this.getAttribute('icon') || 'bi bi-star';
			}
			
			const title = this.querySelector('.feature-title');
			if (title) {
				title.textContent = this.getAttribute('title') || 'Feature';
			}
			const description = this.querySelector('.feature-description');
			if (description) {
				description.textContent = this.getAttribute('description') || '';
			}
		}
	}
});
