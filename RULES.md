# AI Development Rules

## Intro
- see `./README.md`

## JS
- don't use try-catch unless it's unavoidable
- this is not React Component (JSX) or Vue Component (SFC) but inspired by both
- there is no typescript because there is no compilation and must run directly in browser
- able to use `<slot>` in Light DOM using same implementation as native Shadow DOM

## Widget (Web Component)
- To keep it short, I call web components widgets.
- Type of Widget divided into internal and external
- internal widget using `<template>`
- external widget using separate files that are loaded using Fetch API
- external widget files can only contain HTML and CSS
- never write html-in-js like JSX

## Scopes
- all implementations must be based on standard web APIs
- all features must be able to run directly in the browser
- everything must be straight foward with minimal boilerplate
- everything must be straight foward with explicit interface

## Features
- Light DOM (default)
- Shadow DOM
- Slot (default)
- both Light DOM and Shadow DOM must support Slot

## examples
- examples also be used as demos and tests
- examples should provide all the possibilities that this library can do
