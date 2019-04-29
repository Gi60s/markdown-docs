---
layout: default
title: Home
navOrder: create-docs templates
---

# Documentation Made Easy

Create documentation from markdown that can be served from any static web server.

- Supports Github pages
- Supports custom templates
- Auto generates navigation
- Can auto generate table of contents per page

This documentation was created using this tool and the built in [default template](./templates/default.md) but you can also create your own [custom template](./templates/custom.md) to fully customize how it looks and operates.

# Installation

```bash
$ npm install -g @gi60s/markdown-docs
```

# Usage

### Develop Documentation

While you're writing your documentation you can run a server that will both serve your documentation through a browser and auto rebuild your documentation as you make changes.

```bash
$ markdown-docs dev ./source/directory ./destination/directory
```

It is also possible to specify a [custom template](./templates/custom.md) to use for generating your documentation.

```bash
$ markdown-docs dev ./source/directory ./destination/directory ./my-custom-template-directory
```

### Build Documentation

This will build your documentation once. It will not watch for changes and auto rebuild. It will not serve your documentation to a browser.

```bash
$ markdown-docs build ./source/directory ./destination/directory
```
