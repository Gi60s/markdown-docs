---
layout: default
title: The Default Template
subtitle: Templates
---

The default template will be used if you run a build without specifying a template to use. The default template currently has just one layout.

# Template Configuration

This template accepts [document configuration](../create-site/configuration.md) parameters:

| Property | Description |
| -------- | ----------- |
| cssFiles | An array of web paths to use as CSS imports for all of your files |
| cssVars | The CSS variables to use to overwrite the default templates current styling. [Read more about specifying the CSS variables' values](#css-build-variables) |
| favicon | The URL to the favicon |
| finePrint | HTML content to inject at the bottom of the page as a footer. |
| footerLinks | An array of objects with a `title` and `href` property. This entries will be added as links to the footer. |
| jsFiles | An array of web paths to use as JavaScript files to load at the end of the HTML. |

# CSS Build Variables

You can change some of the styling for the default template by specifying properties within your [document configuration](../create-site/configuration.md) file.

| Variable | Description | Default |
| -------- | ----------- | ------- |
| baseFontFamily | The font family used. | `"Helvetica Neue", Helvetica, Arial, sans-serif` |
| baseFontSize | The base font size. | `16px` |
| baseFontWeight | The base font weight. | `400` |
| baseLineHeight | The base line height. | `1.5` |
| backgroundColor | The base background color. | `#FDFDFD` |
| brandColor | Primary branding color. | `#2A7AE2` |
| brandColorDark | Dark brand color. | `#053B80` |
| brandColorLight | Light brand color. | `#B3CFF2` |
| codeBackground | The background color for code sections. | `#828282` |
| greyColor | The gray to use. | `#828282` |
| maxWidth | The maximum width | `1400px` |
| phoneWidth | The width at which the layout will swap to phone mode. | `600px` |
| spacingUnit | The spacing to use to separate parts of the documentation. | `30px` |
| tabletWidth | The width at which the layout will swap to tablet mode. | `800px` |
| textColor | The base text color. | `#111` |

# Page Headers

This template looks at the page headers to define how parts of the page are rendered. Specifically, these are the headers used by the default template.

| Property | Description |
| -------- | ----------- |
| canonical | A relative or absolute URL to this same page that exists elsewhere. This helps SEO. |
| description | The description to add to the HTML header's meta data |
| subtitle | The sub title for the page. |
| title | The title for the page. |
| toc | Supported as described in the [page headers documentation](../create-site/pages.md#headers) |
