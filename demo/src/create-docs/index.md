---
title: Creating Documentation

---

# How It Works

1. You write your documentation using markdown and other static assets (images, JavaScript files, CSS files, etc).

2. You perform a build and specify the destination to output the build to. You can optionally specify a template to use for the build. The build converts markdown files to HTML files that have been wrapped by a template.

3. The build creates a new directory and puts the built content there. You are now ready to serve that content using a static file server.

# Structuring Your Documentation

Within your source file you can add:
 
- Any type of static asset (images, videos, JavaScript files, CSS files, etc.)

- Markdown files (that will be converted to HTML files and wrapped with the template)

- Directories that contain other assets and markdown files.

Each directory must contain an `index.md` file.

The site navigation menu will be generated based on the file system structure of your documentation. The title for links will come from the `title` [header](#headers) for each page.

## Configuration

### The Config File

Your documentation must contain a configuration file at the top level directory of your documentation.

By default the config file should be named `simple-docs.js`, but you can specify what the name of this file is during build or development start up.

**Example Config File**

```js
module.exports = {
  basePath: '/',
  cssVars: {},
  domain: 'http://your-domain.com',
  git: {
    docsSource: '/docs-source',
    repository: 'https://github.com/your-org/your-repository'
  },
  pageDefaults: {
    layout: 'default'
  },
  title: 'Simple Docs'
}
```

### Custom Config File Location

Your documentation can use a custom config file instead of always using the `simple-docs.js` file. This could be useful if you have different settings for development and production documentation.

**Build**

Command Line

```bash
$ simple-docs build -c ./source/my-config.js ./source ./destination
```

Code

```js
const simpleDocs = require('simple-docs')
const promise = simpleDocs.build('/path/to/source', '/path/to/destination', {
  config: '/path/to/my-config.js' 
})
```

**Develop**

Command Line

```bash
$ simple-docs dev -c ./source/my-config.js ./source ./destination
```

Code

```js
const simpleDocs = require('simple-docs')
const promise = simpleDocs.dev('/path/to/source', {
  config: '/path/to/my-config.js' 
})
```

### Config Options

| Option | Description |
| ------ | ----------- |
| basePath | The base path within your domain were the documentation will be served. |
| cssVars | An object that can contain CSS variables to overwrite for a template being used. The variables and values you can place here are dependent on the template you're using. |
| domain | The domain at which your documentation can be reached. |
| git.docSource | Within Github, Gitlab, etc. the location of your documentation source files. If a full URL is not specified then the `git.repository` URL will be prepended to this value. |
| git.repository | The Github, Gitlab, etc. repository for this documentation. |
| pageDefaults | This object contains defaults that you'd like applied to every page unless overwritten by the [page's headers](#headers). |
| title | The title of your entire site. |

# Markdown

## Links

Links within your markdown should be used as normal. If the link reference is pointing to a markdown file within your documentation then point it to the markdown file, not the file that it will be built into. During the build phase these links will automatically be converted. For example:

**Before**

```md
Follow this [link to another page](./link/to/page.md)
```

**After**

```html
<p>Follow this <a href="./link/to/page.html">link to another page</a></p>
```

## Headers

Headers are **REQUIRED** for each markdown file. They are defined at the top of the document and define properties about the page.

**Example Headers Section**

```md

---
title: My Page Title
nav: index page1 page2
toc: true
---
```

### Build Headers

Some headers are specific to the build process while others are specific to the template being used.

These headers are specific to the build process:

| Property | Description | Default |
| -------- | ----------- | ------- |
| layout | The [layout](./templates/layouts.md) from the template to use to render this page. | `default` |
| navOrder | This property is only observed inside of an `index.md` file and is used to specify the order of navigation links within the directory, using the file names, separated by spaces. | |
| title | The title for the page. | |
| toc | Add a table of contents to the top of the file. Set to `false` or `0` to remove the table of contents. Additionally, you can specify how deep the page table of contents runs by setting a number between `1` and `6`. | `true` |

### Template Headers

Some template layouts are looking for headers too and use them to modify the output HTML that is generated. To know what headers are used by a specific template you should refer to the template's documentation.

If you are using the default template then you can check out the [default template headers](../templates/default.md#page-headers).
