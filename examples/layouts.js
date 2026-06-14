import { wietCreate, wietDefine, WietClass } from '../wiet.js';

const moduleBase = new URL('.', import.meta.url).href;

wietDefine('page-header', class extends WietClass() {
	constructor() {
		super();
		this.template = new URL('../widgets/page-header.html', moduleBase).href;
	}

	mounted() {
		// Fix "Back to Examples" link relative to module location
		const brandLink = this.querySelector('.navbar-brand');
		if (brandLink) {
			brandLink.href = new URL('../index.html', moduleBase).href;
		}

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
		this.template = new URL('./footer.html', moduleBase).href;
	}
});


function loadHighlightCSS() {
	if (document.querySelector('link[href*="highlightjs"][href*="gruvbox-dark-soft"]')) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/styles/base16/gruvbox-dark-soft.min.css';
	document.head.appendChild(link);
}

function loadHighlightJS() {
	if (window.hljs) return Promise.resolve();
	return new Promise(resolve => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/highlight.min.js';
		script.onload = resolve;
		document.head.appendChild(script);
	});
}

function loadBeautify() {
	if (window.html_beautify) return Promise.resolve();
	return new Promise(resolve => {
		const base = 'https://cdn.jsdelivr.net/npm/js-beautify@1.15.4/js/lib/';
		const s1 = document.createElement('script');
		s1.src = base + 'beautify.min.js';
		const s2 = document.createElement('script');
		s2.src = base + 'beautify-html.min.js';
		let loaded = 0;
		s1.onload = s2.onload = () => { if (++loaded === 2) resolve(); };
		document.head.appendChild(s1);
		document.head.appendChild(s2);
	});
}

wietDefine('page-source', class extends WietClass() {
	constructor() {
		super();
		this.template = new URL('./source.html', moduleBase).href;
	}

	mounted() {
		this.collapsible();

		const selector = this.getAttribute('selector') || '.source';
		const output = this.querySelector('.card-body');

		void (async () => {
			loadHighlightCSS();
			await Promise.all([loadHighlightJS(), loadBeautify()]);

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
				const pre = wietCreate('pre', {
					props: {
						className: 'p-3 rounded small mb-2 overflow-auto',
					},
				});
				const code = wietCreate('code', {
					props: {
						className: 'language-html',
						textContent: html_beautify(source.outerHTML, { indent_size: 2 }),
					},
				});
				pre.appendChild(code);
				output.appendChild(pre);
				hljs.highlightElement(code);
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
