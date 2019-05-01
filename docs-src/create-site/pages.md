---
title: Pages
subtitle: Create a Site
---

# Markdown to HTML

Every markdown file you create within your project directory will be converted to HTML and placed into the [template layout](../templates/index.md#layouts) you specify (or the default layout if not specified).

Each markdown file that you wish to convert to an HTML page must have a [headers](#headers) section.

**Example Page**

```md
---
title: My First Page
layout: default
---

# Welcome

This is my first page.
```

# Headers

Headers are **REQUIRED** for each markdown file. They are defined at the top of the document and define properties about the page.

**Example Headers Section**

```md
---
title: My Page Title
nav: index page1 page2
toc: true
---
```

## Build Headers

Some headers are specific to the build process while others are specific to the template being used.

These headers are specific to the build process:

| Property | Description | Default |
| -------- | ----------- | ------- |
| layout | The [layout](../templates/index.md#layouts) from the template to use to render this page. | `default` |
| navMenu | Set this to `false` to exclude this page from the navigation menu. | `true` |
| navOrder | This property is only observed inside of an `index.md` file and is used to specify the order of navigation links within the directory, using the file names, separated by spaces. | |
| redirect | This will tell the site navigation to direct to a different location instead of accessing this page, making this page inaccessible. | |
| render | Whether this markdown file should be converted to HTML. Set this value to `false` to keep the markdown file (without the headers). | `true` 
| title | The title for the page. This property is required. | |
| toc | Add a table of contents to the top of the file. Set to `false` or `0` to remove the table of contents. Additionally, you can specify how deep the page table of contents runs by setting a number between `1` and `6`. | `true` |

## Template Headers

Some template layouts are looking for headers too and use them to modify the output HTML that is generated. To know what headers are used by a specific template you should refer to the template's documentation.

If you are using the default template then you can check out the [default template headers](../templates/default.md#page-headers).

# Table of Contents

A table of contents may appear on each of your pages and is controlled by three factors:

1. You must have one or more headings in your markdown.

2. You can change how headings display by setting the `toc` [build header](#build-headers).

3. The [template layout](../templates/index.md#layouts) controls where the table of contents appears if at all.
