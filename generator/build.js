'use strict'
const ejs = require('ejs')
const { EOL } = require('os')
const findBrokenLinks = require('./find-broken-links')
const files = require('./files')
const hljs = require('highlight.js')
const marked = require('marked')
const path = require('path')
const pathIsInside = require('path-is-inside')
const readConfig = require('./read-config')
const sass = require('sass')
const util = require('./util')

const rxHttp = /^https?:\/\//
const rxMarkdownFilePath = /\.md$/i

// TODO: static web page servers that require the .html extension

module.exports = async function (source, destination, { configFilePath, template } = {}) {
  const stats = await files.stat(source)
  if (!stats.isDirectory()) throw Error('Source must be a directory')

  // normalize source and destination and make sure they are not in conflict
  const cwd = process.cwd()
  source = path.resolve(cwd, source)
  destination = path.resolve(cwd, destination)
  if (source === destination) throw Error('Source directory and destination directory cannot be the same')
  if (pathIsInside(destination, source)) throw Error('The destination directory cannot be within the source directory')
  if (pathIsInside(source, destination)) throw Error('The source directory cannot be within the destination directory')

  // remove old destination content
  await files.rmDir(destination)

  // get the build configuration
  const config = readConfig(source, configFilePath)
  if (config.template && config.template.path && !template) template = config.template.path

  // locate the template directory to use
  if (!template) {
    template = path.resolve(__dirname, '..', 'templates', 'default')
  } else if (template.indexOf(path.sep) === -1) {
    template = path.resolve(__dirname, '..', 'templates', template)
  }
  const layouts = await (async () => {
    const layoutsDir = path.resolve(template, 'layouts')
    const fileNames = await files.readdir(layoutsDir)
    const result = {}
    const promises = fileNames.map(async fileName => {
      const content = await files.readFile(path.resolve(layoutsDir, fileName), 'utf8')
      const key = path.basename(fileName, path.extname(fileName))
      result[key] = ejs.compile(content)
    })
    await Promise.all(promises)
    return result
  })()

  // acquire the site structure
  const structure = await getSiteStructure({
    destination,
    map: {},
    root: source,
    source
  })

  // organize navigation
  const nav = organizeNavigation(structure, source, true)

  // flatten the structure
  const map = flattenSiteStructure(structure, {})

  // copy over all assets except css directory
  const assetsDir = path.resolve(template, 'assets')
  if (await files.isDirectory(assetsDir)) {
    const dest = path.resolve(destination, 'template-files')
    await files.ensureDirectoryExists(dest)
    await files.copy(assetsDir, dest, source => {
      const rel = path.relative(assetsDir, source)
      return rel !== 'css'
    })
  }

  // build the template css
  const sassDirectoryPath = path.resolve(template, 'styles')
  if (await files.isDirectory(sassDirectoryPath)) {
    await renderSassFile(sassDirectoryPath, {
      config,
      sassDirectoryPath,
      templateDestination: path.resolve(destination, 'template-files')
    })
  }

  // build the static site
  const customBuilderPath = path.resolve(template, 'builder.js')
  const builder = (await files.isFile(customBuilderPath)) ? require(customBuilderPath) : {}
  await build({ builder, config, destination, layouts, map, nav, root: source, source })

  // find broken links
  const broken = await findBrokenLinks(source)
  if (broken.length > 0) console.error('[' + (new Date().toLocaleTimeString()) + '] WARNING: One or more files has missing or broken links:\n  ' + broken.join('\n  '))
}

async function build ({ builder, config, destination, layouts, map, nav, root, source }) {
  const stats = await files.stat(source)
  const rel = path.relative(root, source)

  if (stats.isDirectory()) {
    await files.ensureDirectoryExists(destination)
    const fileNames = await files.readdir(source)
    const promises = fileNames.map(async fileName => {
      return build({
        builder,
        config,
        destination: path.resolve(destination, fileName),
        layouts,
        map,
        nav,
        root,
        source: path.resolve(source, fileName)
      })
    })
    return Promise.all(promises)

  } else if (stats.isFile()) {
    const ext = path.extname(source)
    const data = map[rel]
    if (data) {
      if (ext.toLowerCase() === '.md') {
        const params = {
          content: builder && builder.markdown
            ? builder.markdown(data.content, marked)
            : marked(data.content, {
              highlight: (code, style) => {
                return hljs.highlight(style, code).value
              }
            }),
          navigation: createNavHtml(nav, config.site.basePath, rel, 0),
          page: Object.assign({}, config.page, data.page, {
            description: config.site.description || data.page.description || '',
            directory: path.dirname(data.path),
            fileName: path.basename(data.path),
            path: data.path
          }),
          site: config.site,
          template: Object.assign({}, config.template),
          toc: buildToc(data.content, data.page.toc)
        }
        const html = layouts[data.page.layout || 'default'](params)
        const destinationPath = path.resolve(path.dirname(destination), path.basename(destination, ext) + '.html')
        await files.writeFile(destinationPath, html)
      } else if (source !== path.resolve(root, 'markdown-docs.js')) {
        await files.copy(source, destination)
      }
    } else if (source !== path.resolve(root, 'markdown-docs.js')) {
      await files.copy(source, destination)
    }
  }
}

function buildToc (content, tocDepth) {
  const root = util.getMarkdownHeadings(content)

  tocDepth = tocDepth === 'true' ? 6 : +tocDepth
  if (isNaN(tocDepth) || tocDepth <= 0) return ''

  return root.children.length ? '<ul class="toc">' + buildTocHtml(root.children, tocDepth, 1, {}) + '</ul>' : ''
}

function buildTocHtml (children, allowedDepth, depth, store) {
  let html = ''
  children.forEach(child => {
    html += '<li><a href="#' + child.ref +'">' + child.title + '</a>'
    if (child.children.length > 0 && allowedDepth > depth) {
      html += '<ul>' + buildTocHtml(child.children, allowedDepth, depth + 1, store) + '</ul>'
    }
    html += '</li>'
  })
  return html
}

function createNavHtml (nav, basePath, currentPath, depth) {
  let html = ''
  if (depth > 0) {
    html += '<li>'
    let route = basePath + '/' + nav.path
      .replace(/(?:^|\/)index.md/i, '')
      .replace(/\.md$/, '')
    html += '<a href="' + route + '"' + (nav.path === currentPath ? ' class="current-page"' : '') + '>' + nav.title + '</a>'
  }
  if (nav.links) {
    html += '<ul>'
    nav.links.forEach(link => {
      html += createNavHtml(link, basePath, currentPath, depth + 1)
    })
    html += '</ul>'
  }
  if (depth > 0) html += '</li>'
  return html
}

function flattenSiteStructure (structure, map) {
  if (!structure.ignore) {
    if (structure.path) map[structure.path] = structure;
    if (structure.links) {
      structure.links.forEach(item => flattenSiteStructure(item, map))
    }
  }
  return map;
}

async function getSiteStructure (options) {
  const { source } = options
  const stats = await files.stat(source)
  if (stats.isDirectory()) {
    const fileNames = await files.readdir(source)
    options.map.links = []
    const promises = fileNames
      .map(async fileName => {
        const map = { parent: options.map }
        options.map.fileName = path.basename(source)
        options.map.path = path.relative(options.root, source)
        options.map.links.push(map)
        return getSiteStructure({
          destination: path.resolve(options.destination, fileName),
          map,
          root: options.root,
          source: path.resolve(source, fileName)
        })
      })
    await Promise.all(promises)
  } else if (stats.isFile()) {
    const ext = path.extname(source)
    if (ext.toLowerCase() === '.md') {
      let rawContent = await files.readFile(source, 'utf8')

      // convert internal links that end in .md to their correct navigation equivalent
      const rxFixLinks = /(\[[^\]]+?]) *(: *([\s\S]+?)$|\(([\s\S]+?)\))/gm
      let content = ''
      let index = 0
      let match
      while ((match = rxFixLinks.exec(rawContent))) {
        const link = match[3] || match[4]
        if (!rxHttp.test(link) && rxMarkdownFilePath.test(link)) {
          const newLink = link.substring(0, link.length - 3)
          content += rawContent.substring(index, match.index) + match[1] +
            (match[2].startsWith(':') ? ': ' + newLink : '(' + newLink + ')')
        } else {
          content += rawContent.substring(index, match.index) + match[0]
        }
        index = match.index + match[0].length
      }
      content += rawContent.substring(index)

      // pull off the headers and read them
      match = /(?:^---([\s\S]+?)---$\s*)?([\s\S]+)?/gm.exec(content)
      if (match && match[1]) {
        const params = { toc: 'true' }
        match[1]
          .split(EOL)
          .forEach(line => {
            const index = line.indexOf(':')
            const key = index !== -1 ? line.substring(0, index).trim() : line
            if (key) params[key] = index !== -1 ? line.substring(index + 1).trim() : ''
          })
        options.map.fileName = path.basename(source, ext)
        options.map.path = path.relative(options.root, source)
        options.map.page = params
        options.map.content = (match[2] || '').trim()
        options.map.navMenu = params.navMenu ? parseMetaString(params.navMenu) : true
        if (path.basename(source, ext) === 'index') {
          options.map.index = true
          options.map.parent.navMenu = options.map.navMenu
          if (params.navOrder) options.map.navOrder = params.navOrder.split(/ +/)
        }
      }
    } else if (path.basename(source) !== 'markdown-docs.js') {
      options.map.copy = true
      options.map.navMenu = false
      options.map.path = path.relative(options.root, source)
    } else {
      options.map.ignore = true
      options.map.navMenu = false
    }
  }
  return options.map
}

function organizeNavigation (structure, source, isRoot) {
  const index = structure.links.find(v => v.index)
  if (!index) throw Error('Missing required index.md file in directory: ' + path.resolve(source, structure.path))
  const result = {
    fileName: index.fileName,
    navName: index.fileName === 'index' ? index.path.replace(/\/?index\.md$/, '').split(path.sep).pop() : index.fileName,
    path: index.path,
    title: index.page.title
  }

  const filteredLinks = structure.links.filter(item => item.navMenu && !item.index && !item.ignore)
  if (filteredLinks.length) {
    result.links = filteredLinks.map(item => {
      if (item.links) {
        return organizeNavigation(item, source, false)
      } else {
        return {
          fileName: item.fileName,
          navName: item.fileName === 'index' ? item.path.replace(/\/?index\.md$/, '').split(path.sep).pop() : item.fileName,
          path: item.path,
          title: item.page.title
        }
      }
    })

    result.links.sort((a, b) => {
      if (index.navOrder) {
        const i = index.navOrder.indexOf(a.navName)
        const j = index.navOrder.indexOf(b.navName)
        if (i === -1 && j === -1) return a.title < b.title ? -1 : 1
        if (i !== -1 && j === -1) return -1
        if (i === -1 && j !== -1) return 1
        return i < j ? -1 : 1
      } else {
        return a.title < b.title ? -1 : 1
      }
    })
  }

  if (isRoot) {
    if (!result.links) result.links = []
    result.links.unshift({
      fileName: index.fileName,
      navName: index.fileName === 'index' ? index.path.replace(/\/?index\.md$/, '').split(path.sep).pop() : index.fileName,
      path: index.path,
      title: index.page.title
    })
  }

  return result
}

function parseMetaString (value) {
  if (value === 'false') return false
  if (value === 'true') return true
  return value
}

async function renderSassFile (filePath, options) {
  const { config, sassDirectoryPath, templateDestination } = options
  const stats = await files.stat(filePath)
  if (stats.isDirectory()) {
    const fileNames = await files.readdir(filePath)
    const promises = fileNames.map(async fileName => {
      const newFilePath = path.resolve(filePath, fileName)
      return renderSassFile(newFilePath, options)
    })
    return Promise.all(promises)

  } else if (stats.isFile) {
    const content = await files.readFile(filePath, 'utf8')
    const rel = path.relative(sassDirectoryPath, filePath)
    if (content.indexOf('// SASS bootstrap') !== -1) {
      const vars = (config.template && config.template.cssVars) || {}
      const rxVariables = /^(\$\S+) *([\s\S]+?); *(?:\/\/ *VAR *(\w+))?$/gm
      let data = ''
      let index = 0
      let match
      while ((match = rxVariables.exec(content.toString()))) {
        const key = match[3]
        data += content.substring(index, match.index) + match[1] + ' ' +
          (key && vars[key] ? vars[key] : match[2]) + ';'
        index = match.index + match[0].length
      }
      data += content.substring(index)

      const options = {
        data,
        includePaths: [ sassDirectoryPath ]
      }
      return new Promise((resolve, reject) => {
        sass.render(options, async function (err, result) {
          if (err) return reject(err)
          const outDir = path.dirname(path.resolve(templateDestination, 'styles', rel))
          const ext = path.extname(filePath)
          const outFileName = path.basename(filePath, ext)
          const outFilePath = path.resolve(outDir, outFileName + '.css')
          await files.ensureDirectoryExists(outDir)
          await files.writeFile(outFilePath, result.css)
          resolve()
        })
      })
    }
  }
}
