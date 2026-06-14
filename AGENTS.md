# AI Development Rules

## Intro
- see `./README.md`
- the `./index.html` is use for website for this library itself

## JS
- Don't use try-catch in the main source code unless it is unavoidable or necessary to keep the library functioning properly.
- Do not use TypeScript in the main source code because there is no compilation and it must be run directly in the browser.
- this is not React Component (JSX) or Vue Component (SFC) but inspired by both
- able to use `<slot>` in Light DOM using same implementation as native Shadow DOM

## Widget (Web Component)
- To keep it short, I call web components widgets.
- Type of Widget divided into internal and external
- internal widgets use `<template>` written in the same file
- external widgets use separate files loaded using the Fetch API.
- External widget files contain HTML and CSS.
- Don't write HTML code in JavaScript like JSX unless it's just simple code or just a few lines of code.

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
- The `komplet` example is a pure implementation of Web Component using all the available features of the standard specification, as a kitchen sink or Swiss army knife for Web Component.
- The `slot-test` example is a pure Web Component implementation of using slots in both the light DOM and Shadow DOM.

## Local Server
- **DILARANG** menjalankan local server (seperti `php -S localhost:8000`).
- local server selalu menggunakan apache/httpd.
- local server sudah selalu disediakan, untuk mengetahuinya URL nya, cek di `APP_URL` di `.env`.
