---
title: Navigation Menu
subtitle: Create a Site
---

The site navigation is derived from a combination of:

1. Your file structure.

2. The [page headers](./pages.md#headers) defined in each directory and sub directory.

To illustrate this, see the following example.

**Example**

This represents an example file structure. The [page headers](./pages.md#headers) for each markdown file are listed in parenthesis next to the file.

```
.
+-- sub-directory
|   +-- index.md    (title: Suby the Sub)
|   +-- page2.md    (title: Suby the Second)
|   +-- three.md    (title: Suby the Third)
+-- index.md        (title: Home)
+-- picture.png
```

This will render a navigation menu like this:

- Home
- Suby the Sub
    - Suby the Second
    - Suby the Third
