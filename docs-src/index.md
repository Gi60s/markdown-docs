---
layout: default
title: Markdown Docs
navOrder: create-site templates
toc: false
---

## What is This?

A minimal configuration, markdown to static site generator.

**Features:**

- A clean, simple, mobile ready, template provided as default UI.

- Easy to create custom templates.

- Compatible with Github pages. 

## Installation

```bash
$ npm install -g @gi60s/markdown-docs
```

## Initialize New Site

This command will initialize a new site's source directory with several markdown documents and will begin serving them.

After running this command, check out the section on [creating documentation](create-site/index.md).

```bash
$ markdown-docs init --serve /path/to/markdown/directory
```

## Get Help

To get general help:

```bash
$ markdown-docs help
```

To get specific help about a command:

```bash
$ markdown-docs dev --help
```
