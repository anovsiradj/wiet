# Wiet

A lightweight native Web Component factory for defining custom elements from inline templates or external files with HTML and CSS. No build step required — just plain standard Web APIs.

the original purpose is inspired by include/require feature in PHP.

## Documentation

A minimal Wiet widget needs just a template and a small component registration.

```html
<template id="hello-template">
  <style>
    .hello { padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    .name { font-weight: bold; margin-bottom: 0.5rem; }
  </style>
  <div class="hello">
    <div class="name"></div>
    <slot></slot>
  </div>
</template>

<hello-card name="World">Welcome to Wiet!</hello-card>
```

```js
import { wiet } from './wiet.js';

wiet('hello-card', '#hello-template', {
  attrs: ['name'],
  mounted() {
    this.updateGreeting();
  },
  methods: {
    updateGreeting() {
      this.querySelector('.name').textContent = `Hello, ${this.name || 'Guest'}!`;
    }
  }
});
```

The `attrs` array also creates matching JS properties, so you can set values with:

```js
const card = document.querySelector('hello-card');
card.name = 'Alice';
```

## Browser Support

Requires browsers with support for:

- ES modules
- Custom elements
- Shadow DOM
- Fetch API

Modern Chrome, Edge, Firefox, and Safari are supported.
