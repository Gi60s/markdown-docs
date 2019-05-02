---
title: Configuration
subtitle: Create a Site
---

The configuration file is an essential part of the static website that will be built. It tells the builder what template to use, what information to display, and what defaults to apply.

By default the configuration file should be named `markdown-docs.js` and should reside in the root of your source directory.

## Example Configuration File

```js
module.exports = {
  page: {               // set page defaults
    layout: 'default',
    toc: true
  },
  site: {               // set site wide information
    editSourceUrl: 'https://github.com/<my-org>/<my-repository>/tree/master/docs-src',
    title: 'Markdown Docs',
    url: 'https://<my-org>.github.io/markdown-docs/',
  },
  template: {           // set template specific information
    path: 'default',
    cssVars: {
      brandColor: '#00A288',
      brandColorLight: '#8BDBCD',
      brandColorDark: '#00382F'
    }
  }
}
```

## Common Configuration File Options

### Page Options

The configuration options that are specific to pages exist in the page object. 

These options act as defaults for the [pages](./pages.md) and can be overwritten in the [page headers](./pages.md#headers) for any [page](./pages.md).

<details><summary>Code Snippit</summary>
<div>

```js
module.exports = {
  page: {               // set page defaults
    layout: 'default',
    toc: true
  },
  ...
}
```

</div></details>

| Option | Description |
| ------ | ----------- |
| layout | The [template layout](../templates/index.md#layouts) to use to render the page. |
| toc | The default [table of contents](./pages.md#table-of-contents) setting. |

### Site Options

The configuration options that are general to the entire site exist in the site object. Whichever [template layout](../templates/index.md#layouts) you use should use these values to render each page.

<details><summary>Code Snippit</summary>
<div>

```js
module.exports = {
  ...
  site: {               // set site wide information
    editSourceUrl: 'https://github.com/<my-org>/<my-repository>/tree/master/docs-src',
    title: 'Markdown Docs',
    url: 'https://<my-org>.github.io/markdown-docs/',
  },
  ...
}
```

</div></details>

| Option | Description |
| ------ | ----------- |
| editSourceUrl | The base URL of where the user could go to edit the online copy of the source directory. If this is omitted then the template should know to exclude this information from the rendered page. |
| title | The title for the website. |
| url | The URL of where to see the rendered website. |

Depending on the [template layout](../templates/index.md#layouts) being used, additional site properties may be used to render the page.

### Template Options

The configuration options that are specific to a template reside here. Most of these options will only be used by the [template layout](../templates/index.md#layouts), the exception being the `path` and `cssVars`.

<details><summary>Code Snippit</summary>
<div>

```js
module.exports = {
  ...
  template: {               // set template specific information
    path: 'default',
    cssVars: {
      brandColor: '#00A288',
      brandColorLight: '#8BDBCD',
      brandColorDark: '#00382F'
    }
  }
}
```

</div></details>

Depending on the [template layout](../templates/index.md#layouts) being used, additional site properties may be used to render the page.

| Option | Description |
| ------ | ----------- |
| path | The path to a custom template to use or the name of a built in template. `default` is a built in template. |
| cssVars | An object used to modify the CSS for a template (and thus the look of the template). Each template defines its own [CSS variables](../templates/default.md#css-build-variables) that can be overwritten. |

## Configuration File Location

Your documentation can use a custom config file instead of always using the `markdown-docs.js` file. This could be useful if you have different settings for development and production documentation.

You can specify which configuration file to use either through the command line or through use of this library in your own code. 

### Build with Custom Config File Location

Command Line

```bash
$ markdown-docs build -c ./source/my-config.js ./source ./destination
```

Code

```js
const markdownDocs = require('markdown-docs')
const promise = markdownDocs.build('/path/to/source', '/path/to/destination', {
  config: '/path/to/my-config.js' 
})
```

### Develop with Custom Config File Location

Command Line

```bash
$ markdown-docs dev -c ./source/my-config.js ./source ./destination
```

Code

```js
const markdownDocs = require('markdown-docs')
const promise = markdownDocs.dev('/path/to/source', {
  config: '/path/to/my-config.js' 
})
```
