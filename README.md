# Web Component Factory - Complete Example

This is a comprehensive demonstration of the minimal, dynamic component factory with all features.

## Files Included

- `component-factory.js` - The minimal component factory (30 lines)
- `index.html` - Complete demo with all features
- `user-card.html` - External HTML component file
- `product-card.html` - External HTML component file (with Shadow DOM)

## Features Demonstrated

### 1. Template Tag (No Shadow DOM)
- Component: `<greeting-card>`
- Uses inline `<template>` tag
- Renders to light DOM
- Has attributes, events, and lifecycle hooks

### 2. Template Tag (With Shadow DOM)
- Component: `<shadow-button>`
- Uses inline `<template>` tag
- Renders to Shadow DOM for style encapsulation
- Demonstrates isolated styling

### 3. External HTML File (No Shadow DOM)
- Component: `<user-card>`
- Loads HTML from `user-card.html`
- Demonstrates file-based components
- Has click handlers and custom events

### 4. External HTML File (With Shadow DOM)
- Component: `<product-card>`
- Loads HTML from `product-card.html`
- Uses Shadow DOM with external file
- Complete style isolation

### 5. Events & Custom Events
- Component: `<counter-widget>`
- Standard events (click)
- Custom events with `dispatchEvent`
- Event bubbling demonstration

### 6. Lifecycle Hooks
- Component: `<lifecycle-demo>`
- `mounted()` - Called when component is added to DOM
- `unmounted()` - Called when component is removed
- `changed()` - Called when attributes change
- Interactive demo with add/remove buttons

## How to Run

1. Make sure all files are in the same directory
2. Start a local server (the example includes instructions)
3. Open `http://localhost:8000` in your browser

Or simply open `index.html` in a browser that supports ES modules served from file:// (some browsers restrict this).

## Component Factory API

```javascript
component(tagName, templateSource, config)
```

### Parameters

- `tagName` (string) - The custom element name (must contain a hyphen)
- `templateSource` (string) - Either:
  - `#template-id` - ID of a `<template>` tag
  - `./file.html` - Path to an external HTML file
- `config` (object) - Optional configuration:
  - `shadow` (boolean) - Use Shadow DOM
  - `attrs` (array) - Observable attributes
  - `mounted` (function) - Called when component is added to DOM
  - `unmounted` (function) - Called when component is removed
  - `changed` (function) - Called when attributes change
  - `on` (object) - Event handlers in format:
    ```javascript
    {
      'selector': {
        'event': handlerFunction
      }
    }
    ```

## Examples

### Basic Component
```javascript
component('my-button', '#button-template');
```

### With Shadow DOM
```javascript
component('my-card', './card.html', { shadow: true });
```

### With Everything
```javascript
component('user-profile', './profile.html', {
  shadow: true,
  attrs: ['username', 'email'],
  
  mounted() {
    console.log('Component ready!');
  },
  
  changed(attr, oldVal, newVal) {
    console.log(`${attr} changed from ${oldVal} to ${newVal}`);
  },
  
  on: {
    'button.save': {
      click() {
        this.dispatchEvent(new CustomEvent('profile-saved', {
          bubbles: true,
          detail: { username: this.getAttribute('username') }
        }));
      }
    }
  }
});
```

### With Slots
```javascript
// Template
<template id="card-template">
  <div class="card">
    <div class="card-header">
      <slot name="header">Default Header</slot>
    </div>
    <div class="card-body">
      <slot>Default content</slot>
    </div>
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

// Component
component('my-card', '#card-template');

// Usage
<my-card>
  <h3 slot="header">Custom Header</h3>
  <p>This goes in the default slot</p>
  <button slot="footer">Click Me</button>
</my-card>
```

## Key Features

✅ **Minimal** - Only ~30 lines of code
✅ **Dynamic** - Create components on the fly
✅ **Template or File** - Use inline templates or external HTML files
✅ **Shadow DOM** - Optional style encapsulation
✅ **Events** - Both standard and custom events
✅ **Attributes** - Reactive attribute system
✅ **Lifecycle** - mounted, unmounted, changed hooks
✅ **Slots** - Default and named slots for content composition
✅ **No Build Step** - Works directly in the browser
✅ **ES6 Modules** - Modern JavaScript

## Browser Requirements

- ES6 Modules support
- Custom Elements v1
- Shadow DOM v1
- Fetch API

All modern browsers (Chrome, Firefox, Safari, Edge) support these features.
