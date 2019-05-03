---
layout: default
title: Markdown Docs
navOrder: create-site github-pages templates
toc: false
---

## What is This?

This is a minimal configuration, markdown to static site generator. Featuring:

- A clean, simple, mobile ready, template provided as default UI.

- Easy to create custom templates.

- Compatible with Github pages. 

## Installation

**Install Globally**

```bash
npm install -g @gi60s/markdown-docs
```

**Project Install**

From within your NPM project's directory:

1. Install the dependency as a dev dependency:

    ```bash
    npm install --save-dev @gi60s/markdown-docs
    ```
    
2. Add NPM scripts to the `package.json` file to run the build or dev scripts. For example:

    ```json
    {
      "name": "my-package",
      "version": "0.0.1",
      "description": "My package",
      "scripts": {
        "docs:build": "markdown-docs build docs-src docs"
        "docs:dev": "markdown-docs dev docs-src"
      },
      ...
    }
    ```
    
3. Run the scripts with either `npm run docs:build` or `npm run docs:dev`.

## Initialize New Site

This command will initialize a new site's source directory with several markdown documents and will begin serving them.

After running this command, check out the section on [creating documentation](create-site/index.md).

```bash
markdown-docs init --serve /path/to/markdown/directory
```

## Get Help

To get general help:

```bash
markdown-docs help
```

To get specific help about a command:

```bash
markdown-docs dev --help
```
