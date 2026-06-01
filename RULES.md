# AI Development Rules

## Intro
- see `./README.md`

## JS
- any errors must be catched using `console.error()` and then rethrown.
- this is not React Component (JSX) or vue component (SFC) but inspired by both
- there is no typescript because there is no compilation and must run directly in browser
- able to use `<slot>` in Light DOM using same implementation as native Shadow DOM

## Widget (Web Component)
- To keep it short, I call web components widgets.
- Type of Widget divided into internal and external
- internal widget using `<template>`
- external widget using separate files that are loaded using Fetch API
- external contains HTML and CSS (maybe JS too, i havent try it yet.)
- never write html in JS like React Component (JSX), because it is hard to read.

## Scopes
- all implementations must be based on standard web APIs
- all features must be able to run directly in the browser
- everything must be straight foward with minimal boilerplate
- everything must be straight foward with explicit interface

## examples
- examples also be used as demos and tests
- examples should provide all the possibilities that this library can do
