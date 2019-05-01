---
title: Create a Custom Template
subtitle: Templates
---

# How to Create a Template

1. Create a directory for your template and give it a name (name the directory)

2. Optionally create an `assets` directory inside of your template directory. This is for static assets that your template will use, including images, CSS, JavaScript, etc. All files within this directory will be copied as is during the build process into the built directory.

2. Create a `layout` directory inside of your template directory and add a `default.html` file to the `layout` directory. [Read more about creating layouts.](#layouts)

3. Create a `styles` directory inside of your template directory if you want to use [SASS styling](https://www.npmjs.com/package/sass) for your template. [Read more about SAAS styling for your templates.](#sass-styles)

## Layouts

**Summary**

- A `default` layout is required and must be named `default.html`.

- Layouts use [EJS](https://www.npmjs.com/package/ejs) templating for dynamic HTML generation.

- When a layout is rendered it gets information about what is being rendered.

**Details**

Your markdown pages can specify which template layout they want to user in their [headers](../create-site/index.md#headers). If a markdown file does not specify which template to use then the `default` template will be used. Therefore, every template must define a `default` template.

To create a layout create an `html` file inside the `layouts` directory. The name you give this file will be the name of the layout that your markdown files can reference it by. For example, if you have a layout file named `main.html` then your markdown file can include in its [headers](../create-site/index.md#headers) `layout: main` to select this layout.

On render, a template receives data about what is to be rendered, including:

- content - The HTML rendered from the markdown file.

- navigation - The HTML rendered navigation based on the documentations directory structure.

- page - Page [headers](../create-site/index.md#headers) as defined by your markdown files as well as default page header values.

- site - Site variables as defined in the documentation's [configuration file](../create-site/index.md#configuration).

- toc - A page's table of contents menu, rendered as specified by the page [headers](../create-site/index.md#headers) as HTML.

**Example**

```html

<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title><%= site.title %> | <%= page.title %></title>
  <% if (page.description) { %><meta name="description" content="<%= page.description %>"><% } %>

  <link rel="icon" href="/favicon.png">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>

<body>
  <% if (page.title) { %>
  <h1><%= page.title %></h1>
  <% } %>
  
  <% if (toc) { %>
  <div class="toc">
    <div>Page Contents</div>
    <%- toc %>
  </div>
  <% } %>
  
  <div class="content">
    <%- content %>
  </div>

  <script src="/assets/js/main.js"></script>
</body>

</html>
```

## SASS Styles 

**Summary**

- [SASS](https://www.npmjs.com/package/sass) files for your template should exist in a `styles` directory at the root of your template's directory.

- [SASS](https://www.npmjs.com/package/sass) files that have a comment `// SASS bootstrap` will be rendered to CSS.

- [SASS](https://www.npmjs.com/package/sass) files that are bootstrapped can also take [configuration file input](../create-site/index.md#configuration) to overwrite default values.

**Description**

Templates can use [SASS](https://www.npmjs.com/package/sass) to generate CSS files. The SASS files must exist in a directory named `styles` in the root of your template's directory. For all SASS files that you'd like rendered, include the comment `// SASS bootstrap`.

While defining your SASS files there may be certain values that you would like to allow the user of your template to define. To accomplish this you must first define the default value and then on the same line add the comment `// VAR varName` where `varName` is the name of the variables that can be used to overwrite the default value.

**Example**

In this example we set the body default color to `#333` but this can be overwritten if the `textColor` is specified in the [configuration file's cssVars object](../create-site/index.md#configuration).

*SCSS File*

```scss
body {
  color: #333; // VAR textColor
  background: white; // VAR backgroundColor
}
```

*Config File*

```js
module.exports = {
  title: 'My Site',
  template: {
    cssVars: {
      textColor: 'white',
      backgroundColor: '#333'
    }
  }
}
```
