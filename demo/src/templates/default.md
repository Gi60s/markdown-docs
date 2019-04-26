---
layout: default
title: The Default Template
---

The default template will be used if you run a build without specifying a template to use.

# CSS Build Variables

You can change some of the styling for the default template by specifying properties within your `simple-docs.js` file.

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

# Layouts

The default template only has one [layout](./layouts.md) named `default`.

## Default Layout 
 
### Features

- Floating navigation
- Mobile ready
- Next and previous buttons
- Titles and sub titles
- Table of (page) contents

### Page Headers

This template looks at the page headers to define how parts of the page are rendered. Specifically, these are the headers used by the default template.

| Property | Description |
| -------- | ----------- |
| canonical | A relative or absolute URL to this same page that exists elsewhere. This helps SEO. |
| description | The description to add to the HTML header's meta data |
| subtitle | The sub title for the page. |
| title | The title for the page. |
| toc | Supported as described in the [headers documentation](../create-docs/index.md#headers) |
