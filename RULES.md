# AI Development Rules

## Intro
- see `./README.md`
- this is not React Component (JSX) or vue component (SFC) but inspired by both

## Widget (Web Component)
- To keep it short, I call web components widgets.
- Type of Widget divided into internal and external
- internal using `<template>`
- external using separate files that are loaded using Fetch API
- never write html in JS like React Component (JSX), because it is hard to read.

## Scopes
- all implementations must be based on standard web APIs
- all features must be able to run directly in the browser

## examples
- examples also be used as demos and tests
