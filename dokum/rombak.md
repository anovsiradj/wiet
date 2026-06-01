setelah mempelajari lebih lanjut tentang Web Components dan standard web APIs,
saya menyadari beberapa hal untuk library wiet.

kekhawatiran:
- belum mengimplementasikan standard method adoptedCallback()
- belum mengimplementasikan standard method attributeChangedCallback()
- sepertinya belum bisa diintegrasikan dengan addEventListener()
- kurang explicit karena mencontoh react dan vue
- WietStaticElement hanya extends ke HTMLElement, padahal seharusnya user punya kebebasan untuk extends class lain, seperti HTMLButtonElement.

visi dan misi:
- memisahkan pakai <template> atau ajax (sudah).
- memaksimalkan semua fitur web component yang sudah disediakan dari standard web APIs

rencana rombak:
- WietStaticElement/WietDynamicElement dijadikan mixin menggunakan teknik Subclass Factories atau Prototype Assignment.
- WietStaticElement/WietDynamicElement mungkin pakai class expression (anonymous)

help plan to refactor this library.


########################################################################################################
########################################################################################################
########################################################################################################

my answer for your question.

- only for component library, this is not react/vue, dont overthinking.
- again, this is not react/vue, maybe but that will make this lib bigger unless there is simpler implementation.
- what do you mean, of course by using HTML/CSS/JS.
- infinitely
- forever
- unless other lib can run in browser directly like jquery,etc.


my response for your feedback.

# bug1 and bug2
function processSlots() should only used on Light DOM,
because Shadow DOM have its own native browser implementation.

# bug3

currently i have no idea, ill think about it later.

# bug4

i was thinking about attr mapping, currently but i dont know how to implement it.
maybe something like this:
```js
attrs: {
	attr: (attr, newval, oldval) => element.querySelector(`.${attr}`).setAttribute(newval),
}
```

# bug5

every error must be catched using `console.error()`


# bug6

this is not single page app like react or vue,
everything will be cleared on refresh.

---

for "Missing Lifecycle Hook: adoptedCallback()" its should be implemented and must be fixed.

for "Incomplete attributeChangedCallback() Behavior", i guess its related to bug4.
maybe using attributeChangedCallback() can be incorporate to fix that.

########################################################################################################
########################################################################################################
########################################################################################################

smoke testing errors.

example-3-external.html
wiet.js:279 [wiet] user-card: changed() callback error TypeError: Cannot set properties of null (setting 'textContent')

example-6-lifecycle.html
wiet.js:279 [wiet] lifecycle-demo: changed() callback error TypeError: Cannot set properties of null (setting 'textContent')

example-10-attrs.html
1). wiet.js:279 [wiet] user-profile: changed() callback error TypeError: Cannot set properties of null (setting 'textContent')
2). [wiet] score-badge: changed() callback error TypeError: Cannot set properties of null (setting 'textContent')

example-11-composition.html
wiet.js:279 [wiet] product-item: changed() callback error TypeError: Cannot set properties of null (setting 'textContent')

example-12-todo.html
wiet.js:279 [wiet] todo-item: changed() callback error TypeError: Cannot read properties of null (reading 'classList')
