/**
 * Shared Components
 * Reusable components used across all example pages
 */

import { component } from './component-factory.js';

// Page Header Component
component('page-header', './components/page-header.html', {
	mounted() {
		// Setup theme toggle
		const toggleBtn = this.querySelector('.theme-toggle');
		const html = document.documentElement;
		
		toggleBtn.addEventListener('click', () => {
			const currentTheme = html.getAttribute('data-bs-theme');
			const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
			html.setAttribute('data-bs-theme', newTheme);
			
			const icon = toggleBtn.querySelector('i');
			icon.className = newTheme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun-fill';
		});
	}
});

// Event Log Component
component('event-log', './components/event-log.html', {
	mounted() {
		const clearBtn = this.querySelector('.clear-log-btn');
		clearBtn.addEventListener('click', () => {
			this.clear();
		});
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
			logContent.innerHTML = '<div class="text-success">Log cleared!</div>';
		}
	}
});

// Example Section Component
component('example-section', './components/example-section.html', {
	attrs: ['icon', 'title', 'description', 'variant'],
	
	mounted() {
		this.updateContent();
	},
	
	methods: {
		updateContent() {
			const variant = this.getAttribute('variant') || 'primary';
			const alert = this.querySelector('.alert');
			alert.className = `alert alert-${variant} example-section`;
			
			const icon = this.querySelector('.example-icon');
			icon.className = this.getAttribute('icon') || 'bi bi-info-circle';
			
			this.querySelector('.example-title').textContent = this.getAttribute('title') || 'Example';
			this.querySelector('.example-description').textContent = this.getAttribute('description') || '';
		}
	}
});

// Feature Card Component
component('feature-card', './components/feature-card.html', {
	attrs: ['icon', 'title', 'description', 'color'],
	
	mounted() {
		this.updateContent();
	},
	
	methods: {
		updateContent() {
			const color = this.getAttribute('color') || 'primary';
			const card = this.querySelector('.feature-card');
			card.className = `card feature-card bg-${color} text-white`;
			
			const icon = this.querySelector('.feature-icon');
			icon.className = this.getAttribute('icon') || 'bi bi-star';
			
			this.querySelector('.feature-title').textContent = this.getAttribute('title') || 'Feature';
			this.querySelector('.feature-description').textContent = this.getAttribute('description') || '';
		}
	}
});
