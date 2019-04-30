module.exports = {
  page: {
    layout: 'default',
    toc: true
  },
  site: {
    editSourceUrl: 'https://github.com/Gi60s/markdown-docs/tree/master/docs-src',
    title: 'Markdown Docs',
    url: 'https://gi60s.github.io/markdown-docs/',
  },
  template: {
    path: 'default',
    cssFiles: [
      '/css/main.css'
    ],
    cssVars: {
      brandColor: '#00A288',
      brandColorLight: '#8BDBCD',
      brandColorDark: '#00382F'
    },
    favicon: '/favicon.png',
    finePrint: '<p>Book icon obtained under the <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank">Creative Commons (Attribution 3.0 Unported)</a> license, created by <a href="https://www.iconfinder.com/laurareen">Laura Reen</a>.</p>',
    footerLinks: [
      { title: 'Github', href: 'https://github.com/Gi60s/markdown-docs' },
      { title: 'NPM', href: 'https://www.npmjs.com/package/@gi60s/markdown-docs' }
    ]
  }
}
