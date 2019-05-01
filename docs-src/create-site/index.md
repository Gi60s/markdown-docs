---
title: Create a Site
---

# How It Works

1. Select or create a directory of where you'll put your markdown files and other resources (images, videos, etc.).

    This directory will be known as your *source* directory.

2. If you don't already have your source directory started then initialize the site with the command line tool:

    ```bash
    markdown-docs init --serve /path/to/source-dir
    ```
    
    If you source directory has been started then make sure you have a [configuration file](./configuration.md) and use the command line tool to auto build and serve the documentation:
    
    ```bash
    markdown-docs dev /path/to/source-dir
    ```

3. Write your markdown files and use a web browser to look at the result of the static website.

# Structuring Your Documentation

Within your source directory you can add:
 
- Any type of static asset (images, videos, JavaScript files, CSS files, etc.)

- Markdown files (that will be converted to HTML files and wrapped with the template)

- Directories that contain other assets and markdown files.

Each directory must contain an `index.md` file.

The site navigation menu will be generated based on the file system structure of your documentation. The title for links will come from the `title` [header](#headers) for each page.
