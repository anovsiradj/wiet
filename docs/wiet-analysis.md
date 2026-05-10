# Wiet Project Analysis & Review

## 1. Project Overview
"Wiet" is a lightweight, zero-dependency Web Component factory. It simplifies the boilerplate of defining `HTMLElement` classes by providing a functional wrapper (`wiet(tag, template, config)`). It allows creating components using inline `<template>` tags or external HTML files, optionally encapsulated with Shadow DOM.

### Strengths
- **Zero Build Step:** Uses pure ES6 modules and native browser APIs.
- **Tiny Footprint:** Very minimal code, easy to understand.
- **External Templates:** Fetching `.html` files dynamically is a great DX feature for simple projects avoiding bundlers.
- **Declarative Events:** The `handles` configuration provides a clean way to bind events to selectors, reducing boilerplate in `connectedCallback`.

## 2. Honest Reviews & Criticisms

### A. Lifecycle Re-connection Bug
**Issue:** If a `WietDynamicElement` is removed from the DOM and re-inserted, `connectedCallback` runs again. Currently, it saves `this.innerHTML` as `slotContent`, fetches the template again, and overwrites `this.innerHTML`. For Light DOM components, `this.innerHTML` at this point contains the *already rendered* template from the first connection, not the original slotted content. This will duplicate or break the component layout.

### B. Slot Processing Anti-Pattern
**Issue:** `processSlots` manually replaces `<slot>` elements with slotted content. 
- **Shadow DOM:** This defeats the purpose of native Shadow DOM slot projection, which is dynamic and handles fallback content natively. By replacing the `<slot>` element, if the host's children change later, the component won't update.
- **Light DOM:** Replacing slots manually works for a single render, but again, breaks upon re-renders or dynamic content injection.

### C. No Built-in State Reactivity
**Issue:** While `changed` handles `attributeChangedCallback`, there is no internal state (`state` or `props`) that triggers a re-render. All DOM updates inside `methods` require manual query selectors (e.g., `this.querySelector('.name').textContent = ...`). This is fine for vanilla JS but scales poorly compared to libraries like `Lit` or `Alpine.js`.

### D. Network Waterfall on External Templates
**Issue:** Because templates are fetched during `connectedCallback`, if you have nested custom elements, the child won't fetch its template until the parent has fetched, parsed, and rendered its own template. This creates a severe network waterfall.

### E. Prototype Assignment Flaw
**Issue:** In `wiet()`, `config.methods` are merged into `WietDynamicElement.prototype` using `Object.assign()`. This copies properties but doesn't properly copy Getters/Setters. Also, if `wiet()` is called twice with the same tag, it throws away the newly created class and doesn't apply methods to the already registered class.

## 3. Useful Ideas & Suggestions

1. **Native Slots for Shadow DOM:** Bypass `processSlots` entirely if `config.shadow` is true. Let the browser handle `<slot>` natively. Only use custom slot processing for Light DOM rendering.
2. **Template Caching:** Implement a static cache in `WietStaticElement` so that multiple instances of the same component don't re-fetch the external HTML or re-query the `<template>` element.
3. **Template Pre-loading:** Fetch external templates during `wiet()` registration rather than waiting for `connectedCallback`. 
4. **Lightweight Reactivity (Signals or Proxy):** Introduce a small `state` object using JavaScript Proxies. When `state.foo` changes, automatically trigger a partial or full re-render without manual DOM manipulation.
5. **Re-render Resilience:** Check if the element has already been rendered (e.g., by setting a `_hasRendered` flag) to prevent re-fetching and overwriting innerHTML on DOM moves.

---

## 4. Interrogation Questions
To ensure I build exactly what you want, I need to know your true intentions. Please answer these questions:

1. **What is the endgame for Wiet?** Is this a fun educational exercise, a tool for a specific internal project, or do you want this to rival libraries like Lit and Stencil? 
2. **How much "magic" do you want?** Do you strictly want manual DOM updates (vanilla style), or are you looking for a reactive system where updating a variable automatically updates the DOM?
3. **Are you okay with the current Light DOM slot behavior?** Manual slot replacement breaks if the user dynamically appends children to your element later via JS. Do we care about dynamic children, or is this just for static initialization?
4. **Shadow DOM Slots:** Should we switch to native slot projection for Shadow DOM to fix the current implementation?
5. **Network performance:** Do you want me to implement template caching and pre-fetching to prevent network waterfalls?
