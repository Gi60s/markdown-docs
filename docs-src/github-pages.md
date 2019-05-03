---
title: Github Pages
toc: false
---

This page is intended for individuals who are already familiar with Github and how to make repositories, clone them, push them, etc.

### How to serve your static website from Github pages

1. Create a github repository if one does not already exist.

2. Get a copy of your remote repository locally if not already done.

3. Create a directory within your local repository where you'll write your documentation.

    You can do this with the command line utility if you've installed it. Within your repository directory run the following command to set up a starter for your documentation within the `docs-src` directory.
    
    ```bash
    markdown-docs init docs-src
    ``` 

4. Build your site to the `docs` directory.

    ```bash
    markdown-docs build docs-src docs
    ```
    
    Or if you prefer you can develop the docs and build them at the same time:
    
    ```bash
    markdown-docs dev --destination docs docs-src
    ```
    
5. Commit all files and push to Github.

6. Navigate to your github repository's settings page. Find the option to use github pages and tell it to use the `docs` directory.

7. Your site will be available in a few seconds at `https://ORG_NAME.github.io/REPO_NAME` where `ORG_NAME` is your username or organization and `REPO_NAME` is the repository name on Github.
