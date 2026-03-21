# Wiet

A lightweight web component factory for defining custom elements from inline templates or external HTML files.

## Project Files

- `wiet.js` - Core factory (`wiet`) and base class (`WietStaticElement`)
- `widgets.js` - Shared demo widgets used by example pages
- `widgets/` - External templates for shared widgets
- `index.html` - Example index page
- `example-1-template.html` to `example-7-slots.html` - Focused feature demos
- `user-card.html`, `product-card.html` - External component templates used by examples

## Features

- Define components from:
	- Inline `<template>` by id (for example `#card-template`)
	- External HTML file path (for example `./card.html`)
- Optional Shadow DOM rendering (`shadow: true`)
- Slot support (default and named slots with fallback content)
- Declarative event binding via `config.handles`
- Lifecycle hooks:
	- `mounted(root)`
	- `unmounted()`
	- `changed(attr, oldVal, newVal)`
- Reactive attributes through `attrs`
- Instance methods through `methods`

## Quick Start

1. Serve this folder with any local web server:

```bash
python -m http.server 8000
```

2. Open [http://localhost:8000](http://localhost:8000)
3. Start from `index.html` and open any example card

## API

```js
wiet(tag, template, config)
```

### Parameters

- `tag` (`string`)
	- Custom element name, must include `-`
- `template` (`string`)
	- `#template-id` for inline templates
	- File path for external HTML templates
- `config` (`object`, optional)
	- `shadow` (`boolean`) - Render into shadow root
	- `attrs` (`string[]`) - Observed attributes
	- `mounted(root)` (`function`) - Called after render
	- `unmounted()` (`function`) - Called on disconnect
	- `changed(name, oldVal, newVal)` (`function`) - Called on observed attribute changes while connected
	- `handles` (`Record<string, Record<string, Function>>`) - Event map by selector and event name
	- `methods` (`Record<string, Function>`) - Custom instance methods mixed into the element prototype

## Example

```js
import { wiet } from './wiet.js';

wiet('hello-card', '#hello-template', {
	attrs: ['name'],
	mounted() {
		this.renderName();
	},
	changed(attr) {
		if (attr === 'name') this.renderName();
	},
	handles: {
		'.btn-hello': {
			click() {
				alert(`Hello ${this.getAttribute('name') || 'Guest'}!`);
			}
		}
	},
	methods: {
		renderName() {
			this.querySelector('.name').textContent = this.getAttribute('name') || 'Guest';
		}
	}
});
```

## Demo Coverage

- `example-1-template.html` - Template + light DOM + attrs/events
- `example-2-shadow.html` - Template + shadow DOM
- `example-3-external.html` - External template + light DOM
- `example-4-external-shadow.html` - External template + shadow DOM
- `example-5-events.html` - Native and custom events
- `example-6-lifecycle.html` - `mounted`, `unmounted`, `changed`
- `example-7-slots.html` - Default and named slots

## Browser Support

Requires browsers with support for:

- ES modules
- Custom elements
- Shadow DOM
- Fetch API

Modern Chrome, Edge, Firefox, and Safari are supported.
