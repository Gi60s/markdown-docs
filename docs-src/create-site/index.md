---
title: Create a Site
navOrder: pages configuration navigation links
---

## Quick Start

1. If you haven't installed the application, do so:

    ```bash
    npm install -g @gi60s/markdown-docs
    ```

2. Initialize a new site. Be sure to specify your desired source directory.

    ```bash
    markdown-docs init --serve </path/to/source-dir>
    ```
    
3. Open the source directory and start editing, adding, or removing markdown files.

## What You Need to Know

The markdown-docs library converts markdown documents into HTML documents through a build process.

- Every markdown file will be converted to a [page](./pages.md) that will be rendered using a [template layout](../templates/index.md#layouts).

- By default there is one template and one layout, but you can [create a custom template with its own custom layouts](../templates/custom.md).

- Every directory (and sub directory) must have an `index.md` file with [page headers](./pages.md#headers).

- The directory structure along with a [page headers](./pages.md#headers) `title` define the [site navigation](./navigation.md).

- All markdown files that should be converted to HTML must have [page headers](./pages.md#headers).

- Run in development to see your site fully rendered locally.

## Command Line Usage

`markdown-docs help` - Get general help.

`markdown-docs <command> --help` - Get help about a specific command. Use this to see what options are available for each command.

`markdown-docs build [options] <source-directory> <destination-directory>` - Build your markdown files into a static website.

`markdown-docs dev [options] <source-directory>` - Start a server to render your markdown files while you work on updating them.

`markdown-docs init [options] <source-directory>` - A quick start to get up and running for a new site.
