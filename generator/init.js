'use strict'
const files = require('./files')
const path = require('path')

module.exports = async function (source, { gitOrg = '<git-org>', gitRepository = '<git-repository>'} = {}) {
  const srcDirectory = path.basename(source)
  await files.ensureDirectoryExists(source)

  const hasGit = gitOrg !== '<git-org>' && gitRepository !== '<git-repository>' ? '' : '// '
  await createPage(source, 'markdown-docs.js', `
    module.exports = {
      page: {
        layout: 'default',
        toc: true
      },
      site: {
        ${hasGit}editDocsUrl: 'https://github.com/${gitOrg}/${gitRepository}/tree/master/${srcDirectory}',
        title: 'Your Site Title',
        ${hasGit}url: 'https://${gitOrg}.github.io/${gitRepository}/'
      },
      template: {
        name: 'default',
        cssFiles: [
          '/css/main.css'
        ],
        cssVars: {
          brandColor: '#00A288',
          brandColorLight: '#8BDBCD',
          brandColorDark: '#00382F'
        },
        favicon: '/favicon.png',
        finePrint: '<p>This is some mighty find print. Yes, some mighty fine print.</p>' +
          '<p><strong>NOTE:</strong> Book icon obtained under the <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank">Creative Commons (Attribution 3.0 Unported)</a> license, created by <a href="https://www.iconfinder.com/laurareen">Laura Reen</a>. So, if you want to keep this icon you need to keep the attribution.</p>',
        footerLinks: [
          { title: 'Github', href: 'https://github.com/${gitOrg}/${gitRepository}' }
        ]
      }
    }`)

  const configFilePath = path.resolve(source, 'markdown-docs.js')
  await createPage(source, 'index.md', `
    ---
    title: Home
    navOrder: second nested
    ---
    
    # Getting Started
    
    Creating a static website from markdown files is as simple as creating those markdown files on your file system and
    telling the \`markdown-docs\` library how you want to convert them to HTML.
    
    1. Take a look at the files created on your file system at \`${source}\`

    2. Create new markdown files here or modify existing ones.
    
    3. Update your configuration file at \`${configFilePath}\` to modify site title, colors, and the template to use.
    
    ## Start the Server
    
    Run the local server with the command \`markdown-docs dev ${source}\` and open a browser to the URL specified.
    
    # Further Reading
    
    For further reading, check out the full docs at https://gi60s.github.io/markdown-docs/`)

  await createPage(source, 'second.md',`
    ---
    title: Second Page
    ---
    
    This is the second page. Check out the [nested page](./nested/index.md) too.
    `)

  await createPage(source, 'nested/index.md', `
    ---
    title: Nested Page
    ---
    
    This is a nested page.
    
    In the navigation menu this resides with the items in the parent directory, but within the file system it is
    the \`index.md\` file within the \`nested\` directory.
    
    Look at the file system at \`${source}\` and this will make sense.
    `)

  await createPage(source, 'nested/sibling.md', `
    ---
    title: Nested Sibling
    ---
    
    This is another nested page.
    
    In the navigation menu this resides as a child of the [nested](./index.md) page, but within the file system it is
    the a sibling file of the [nested](./index.md) page.
    
    Look at the file system at \`${source}\` and this will make sense.
    `)

  await files.copy(path.resolve(__dirname, '..', 'docs-src', 'favicon.png'), path.resolve(source, 'favicon.png'))
  await files.copy(path.resolve(__dirname, '..', 'docs-src', 'book-48.png'), path.resolve(source, 'book-48.png'))

  await files.ensureDirectoryExists(path.resolve(source, 'css'))
  await files.copy(path.resolve(__dirname, '..', 'docs-src', 'css', 'main.css'), path.resolve(source, 'css', 'main.css'))
}

async function createPage(source, filePath, content) {
  const fullPath = path.resolve(source, filePath)
  await files.ensureDirectoryExists(path.dirname(fullPath))

  const lines = content.split('\n')
  lines.shift()

  const match = /^( *)/.exec(lines[0])
  const indent = match && match[1] ? match[1].length : 0
  const data = lines.map(v => v.substring(indent)).join('\n')

  await files.writeFile(fullPath, data)
}
