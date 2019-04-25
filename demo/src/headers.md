---
layout: default
title: Headers
toc: true
---

# H1 1

# H1 2

## H2 2.1

## H2 2.2

### H3 2.2.1

### H3 2.2.2

### H3 2.2.3

## H2 2.3

### H3 2.3.1

#### H4 2.3.1.1

##### H5 2.3.1.1.1

###### H6 2.3.1.1.1.1

#### H4 2.3.1.2

# H1 3




Every markdown file can have a headers section added to the top with several configurable options. You're markdown file might look something like this with headers:

```md

---
title: My Page Title
subtitle: Sub Title
nav: index page1 page2
toc: true
---

# My Markdown File
```

Here is a list of possible header properties and what they do:

| Property | Description | Default |
| -------- | ----------- | ------- |
| canonical | A relative or absolute URL to this same page that exists elsewhere. This helps SEO. | |
| description | The description to add to the HTML header's meta data | |
| navOrder | This property is only observed inside of an `index.md` file and is used to specify the order of navigation links within the directory, using the file names, separated by spaces. | |
| next | Set to a navigation link to show a next button that will navigate to this route. | |
| previous | Set to a navigation link to show a previous button that will navigate to this route. | |
| subtitle | The sub title for the page. | |
| title | The title for the page. | |
| toc | Add a table of contents to the top of the file | `true` |
