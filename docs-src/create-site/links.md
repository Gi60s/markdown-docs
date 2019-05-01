---
title: Links
subtitle: Create a Site
---

Links within your markdown should be used as normal. If the link reference is pointing to a markdown file within your documentation then point it to the markdown file, not the file that it will be built into. During the build phase these links will automatically be converted. 

For example:

**Before**

```md
Follow this [link to another page](./link/to/page.md#header-name)
```

**After**

```html
<p>Follow this <a href="./link/to/page#header-name">link to another page</a></p>
```
