---
title: Templates

---

Templates are used to generate the HTML, CSS, and JavaScript that surround your markdown file's content. You can use the templates included with this library, or you can define and use your own [custom templates](./custom.md).

There is currently one built in template: [default](./default.md).

# Layouts

- Each template can define one or more layouts.

- Each layout has its own HTML, CSS, and JavaScript. A common reason to have more than one layout would be to display pages that are top level pages differently than pages that a sub pages.

- A layout will contain the content from your markdown file(s).

- Layouts are HTML files that use [EJS](https://www.npmjs.com/package/ejs) syntax among the HTML tags to produce dynamic HTML.

# Styles

- Templates uses [SASS](https://www.npmjs.com/package/sass) to dynamically generate CSS.

- Generated CSS files will automatically be put into the built directory within the `assets/css` directory.

- Template SASS files may accept configurable variables from the build, just like the [default template](./default.md#css-build-variables) allows.
