# Wiet

Tiny, standards-first Web Component factory.
Define custom elements from inline `<template>` tags or external HTML files — no build step required.

the original purpose is inspired by include/require in PHP.

## Documentation

```html
<template id="hello-template">
	<style>
		.name{
			font-weight:700
		}
	</style>

	<div>
		<div class="name"></div>
		<slot></slot>
	</div>
</template>

<script type="module">
import { wiet, mixin } from './wiet.js';

wiet('hello-card', class extends mixin() {
	static attrs = ['name'];

	constructor() {
		super();
		this.template = '#hello-template';
	}

	mounted() {
		this.updateGreeting();
	}

	updateGreeting() {
		this.querySelector('.name').textContent = `Hello, ${this.name || 'Guest'}!`;
	}
})
</script>
```

## Browser Requirements

- ES modules
- Custom elements
- Shadow DOM
- Fetch API
