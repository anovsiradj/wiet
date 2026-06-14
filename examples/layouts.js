import { wietCreate, wietDefine, WietClass } from '../wiet.js';

wietDefine('page-header', class extends WietClass() {
	constructor() {
		super();
		this.template = './widgets/page-header.html';
	}

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

wietDefine('page-footer', class extends WietClass() {
	constructor() {
		super();
		this.template = './examples/footer.html';
	}
});


wietDefine('view-code', class extends WietClass() {
	constructor() {
		super();
		this.template = './widgets/view-code.html';
	}

	mounted() {
		this.collapsible();

		const selector = this.getAttribute('selector') || '.source';
		const output = this.querySelector('.card-body');

		void (async () => {
			await new Promise(resolve => {
				if (document.readyState === 'complete') {
					resolve();
				} else {
					window.addEventListener('load', resolve, { once: true });
				}
			});

			const sourcesAfterLoad = document.querySelectorAll(selector);
			for (const source of sourcesAfterLoad) {
				if (source.dataset.fetch) {
					try {
						source.textContent = await fetch(source.dataset.fetch).then(r => r.text());
					} catch (e) {
						source.textContent = `/* failed to load ${source.dataset.fetch} */`;
					}
				}
				output.appendChild(wietCreate('pre', {
					props: {
						className: 'bg-dark text-light p-3 rounded small mb-2 overflow-auto',
						textContent: source.outerHTML,
					},
				}));
			}
		})();
	}

	collapsible() {
		const id = 'source-' + Date.now().toString(36);
		const header = this.querySelector('.card-header');
		const output = this.querySelector('.card-body');

		header.setAttribute('data-bs-target', `#${id}`);
		header.setAttribute('aria-expanded', 'false');
		header.setAttribute('role', 'button');
		header.classList.add('cursor-pointer');
		output.setAttribute('id', id);
	}
});
