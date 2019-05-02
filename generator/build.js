'use strict'
const ejs = require('ejs')
const { EOL } = require('os')
const findBrokenLinks = require('./find-broken-links')
const files = require('./files')
const fileErrors = require('./file-errors')
const hljs = require('highlight.js')
const marked = require('marked')
const path = require('path')
const pathIsInside = require('path-is-inside')
const readConfig = require('./read-config')
const sass = require('sass')
const util = require('./util')

const rxHttp = /^https?:\/\//

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

  // get the build configuration
  configFilePath = configFilePath ? path.resolve(process.cwd(), configFilePath) : path.resolve(source, 'markdown-docs.js')
  const config = readConfig(configFilePath)
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

  // set up file errors and file warnings
  const fe = fileErrors()
  const fw = fileErrors()

  const markdownStore = {}
  const codeBlocks = {}
  await files.eachFile(source, async function (filePath) {
    if (path.extname(filePath).toLowerCase() !== '.md') return

    const content = String(await files.readFile(filePath, 'utf8'))
    const [ , header, body ] = /(?:^---([\s\S]+?)---$\s*)?([\s\S]+)?/gm.exec(content)

    // parse page headers if they exist
    const headers = Object.assign({}, config.page)
    if (header) {
      header
        .split(EOL)
        .forEach(line => {
          const index = line.indexOf(':')
          const key = index !== -1 ? line.substring(0, index).trim() : line
          if (key) headers[key] = index !== -1 ? line.substring(index + 1).trim() : ''
        })
      if (headers.render === 'false') return // this markdown file should not be rendered
      if (!headers.title) fe.add('Missing required "title" header')
    } else {
      fe.add(filePath, 'Missing required page headers section.')
    }

    // get code segment positions
    codeBlocks[filePath] = []
    const rxCodeBlock = /`{3}[\s\S]+?`{3}|`[\s\S]+?`/g
    let match
    while ((match = rxCodeBlock.exec(body))) {
      codeBlocks[filePath].push({ start: match.index, end: match.index + match[0].length })
    }

    // convert links
    const rxFixLinks = /(\[[^\]]+?]) *(: *([\s\S]+?)$|\(([\s\S]+?)\))/gm
    let newBody = ''
    let index = 0
    while ((match = rxFixLinks.exec(body))) {
      const link = match[3] || match[4]
      if (!rxHttp.test(link) && !indexWithinRanges(match.index, codeBlocks[filePath])) {
        const [ linkPath, linkHash ] = link.split('#')
        const fullPathToLink = path.resolve(path.dirname(filePath), (linkPath || filePath).split('/').join(path.sep))
        const relPathToLink = path.relative(source, fullPathToLink)
        let newLink = config.site.basePath + '/' + relPathToLink.split(path.sep).join('/')
        newLink = newLink.toLowerCase().endsWith('/index.md')
          ? newLink.substring(0, newLink.length - 9)
          : newLink.substring(0, newLink.length - 3)
        if (linkHash) newLink += '#' + linkHash
        newBody += body.substring(index, match.index) + match[1] +
          (match[2].startsWith(':') ? ': ' + newLink : '(' + newLink + ')')
      } else {
        newBody += body.substring(index, match.index) + match[0]
      }
      index = match.index + match[0].length
    }
    newBody += body.substring(index)

    const relKey = path.relative(source, filePath).split(path.sep).join('/')
    const urlPath = config.site.basePath + '/' + relKey
    const isIndex = urlPath.toLowerCase().endsWith('/index.md')
    markdownStore[filePath] = {
      content: newBody,
      filePath,
      headers,
      isIndex,
      urlPath: urlPath.substring(0, urlPath.length - (isIndex ? 9 : 3)),
      urlPathFull: urlPath
    }
  })

  // build the site navigation structure
  const structure = (await getSiteStructure(source, []))[0]
  const nav = organizeNavigation(structure, markdownStore, fe.add)

  // if there are file errors then report now and exit
  if (fe.hasErrors()) {
    console.error(fe.report('[' + (new Date().toLocaleTimeString()) + '] ERROR: Unable to build due to one or more file errors:'))
    return false
  }

  // remove old destination content
  await files.rmDir(destination)

  // copy over all template assets
  const assetsDir = path.resolve(template, 'assets')
  if (await files.isDirectory(assetsDir)) {
    const dest = path.resolve(destination, 'template-files')
    await files.copy(assetsDir, dest)
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

  // copy all files that don't need special rendering
  await files.copy(source, destination, function (filePath) {
    if (filePath === configFilePath) return false
    const data = markdownStore[filePath]
    return !data || data.headers.render === 'false'
  })

  // build the static site
  const customBuilderPath = path.resolve(template, 'builder.js')
  const builder = (await files.isFile(customBuilderPath)) ? require(customBuilderPath) : {}
  await build({ builder, codeBlocks, config, destination, fileErrors: fe.add, layouts, markdownStore, nav, source })

  // find broken links
  await findBrokenLinks(source, fw.add)
  if (fw.hasErrors()) console.error(fw.report('[' + (new Date().toLocaleTimeString()) + '] WARNING: One or more files have missing or broken links:'))
}

async function build ({ builder, codeBlocks, config, destination, fileErrors, layouts, markdownStore, nav, source }) {
  const promises = Object.keys(markdownStore)
    .map(async filePath => {
      const data = markdownStore[filePath]
      if (data.headers.render !== 'false') {
        // initialize EJS params
        const params = {
          page: Object.assign({}, config.page, data.headers, {
            description: config.site.description || data.headers.description || '',
            directory: path.dirname(data.filePath),
            fileName: path.basename(data.filePath),
            path: data.path
          }),
          site: config.site,
          template: Object.assign({}, config.template)
        }

        // final markdown modifications
        let content = await runImports(source, filePath, markdownStore, codeBlocks, fileErrors)

        // add to EJS params and render
        params.content = builder && builder.markdown
          ? builder.markdown(content, marked)
          : marked(content, {
            highlight: (code, style) => {
              return style ? hljs.highlight(style, code).value : code
            }
          })
        params.navigation = createNavHtml(nav, filePath, 0)
        params.toc = buildToc(content, data.headers.toc)
        const html = layouts[data.headers.layout || 'default'](params)

        // determine write location and write
        const ext = path.extname(filePath)
        const relFilePath = path.relative(source, filePath)
        const targetDirectory = path.resolve(destination, path.dirname(relFilePath))
        const destinationPath = path.resolve(targetDirectory, path.basename(relFilePath, ext) + '.html')
        await files.ensureDirectoryExists(targetDirectory)
        await files.writeFile(destinationPath, html)
      }
    })
  return Promise.all(promises)
}

function buildToc (content, tocDepth) {
  const root = util.getMarkdownHeadings(content)

  tocDepth = tocDepth === 'true' || tocDepth === true ? 6 : +tocDepth
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

function createNavHtml (nav, currentPath, depth) {
  if (nav.isIndex && depth !== 1) return ''
  let html = ''
  if (depth > 0) {
    html += '<li><a href="' + nav.url + '"' + (nav.filePath === currentPath ? ' class="current-page"' : '') + '>' + nav.title + '</a>'
  }
  if (nav.children && nav.children.length) {
    html += '<ul>' + nav.children.map(child => createNavHtml(child, currentPath, depth + 1)).join('') + '</ul>'
  }
  html += '</li>'
  return depth === 0 ? '<ul>' + html + '</ul>' : html
}

async function getSiteStructure (source, map) {
  const stats = await files.stat(source)
  if (stats.isDirectory()) {
    const item = {
      children: [],
      filePath: source
    }
    map.push(item)
    const fileNames = await files.readdir(source)
    const promises = fileNames.map(fileName => getSiteStructure(path.resolve(source, fileName), item.children))
    return Promise.all(promises).then(() => map)
  } else if (stats.isFile() && path.extname(source).toLowerCase() === '.md') {
    map.push({ filePath: source })
  }
  return map
}

function organizeNavigation (structure, markdownStore, fileError) {
  if (structure.children) {
    const nav = { children: [] }
    let hasNonIndex = false
    let index
    let indexNavMenu = true

    structure.children.forEach(child => {
      const result = organizeNavigation(child, markdownStore, fileError)
      if (result.isIndex) {
        index = result
      } else {
        hasNonIndex = true
      }
      if (result.inNav) nav.children.push(result)
    })

    if (!index) {
      if (hasNonIndex) fileError(structure.filePath, 'Missing required index.md file')
    } else if (indexNavMenu) {
      nav.filePath = index.filePath
      nav.inNav = index.inNav
      nav.title = index.title
      nav.url = index.url

      const navOrder = index.navOrder ? index.navOrder.split(/ +/) : []
      navOrder.unshift(index.id)
      nav.children.sort((a, b) => {
        if (navOrder) {
          const i = navOrder.indexOf(a.id)
          const j = navOrder.indexOf(b.id)
          if (i === -1 && j === -1) return a.title < b.title ? -1 : 1
          if (i !== -1 && j === -1) return -1
          if (i === -1 && j !== -1) return 1
          return i < j ? -1 : 1
        } else {
          return a.title < b.title ? -1 : 1
        }
      })
    }

    return nav
  } else {
    const data = markdownStore[structure.filePath]
    const fileName = path.basename(structure.filePath)
    const ext = path.extname(structure.filePath)
    return {
      filePath: structure.filePath,
      id: path.basename(fileName, ext),
      isIndex: fileName.toLowerCase() === 'index.md',
      inNav: data.headers.navMenu !== 'false',
      navOrder: data.headers.navOrder,
      title: data.headers.title,
      url: data.urlPath
    }
  }
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

async function runImports (source, filePath, markdownStore, codeBlocks, fileErrors) {
  const data = markdownStore[filePath]
  const ranges = codeBlocks[filePath] || []
  if (!data.ranImports && data.content) {
    data.ranImports = true
    const rxImport = /{% import ([\s\S]+) %}/g
    const content = data.content
    let index = 0
    let result = ''
    let match
    while ((match = rxImport.exec(data.content))) {
      result += content.substring(index, match.index)
      index = match.index + match[0].length

      const importFilePath = path.resolve(path.dirname(filePath), match[1])
      if (indexWithinRanges(match.index, ranges)) {
        result += match[0]
      } else if (markdownStore[importFilePath]) {
        result += await runImports(source, importFilePath, markdownStore, codeBlocks, fileErrors)
      } else if (await files.isFile(importFilePath)) {
        result += await files.readFile(importFilePath, 'utf8')
      } else {
        fileErrors(filePath, 'Cannot import not existing file: ' + match[1])
      }
    }
    result += content.substring(index)
    data.content = result
  }
  return data.content
}

function indexWithinRanges (index, ranges) {
  const length = ranges.length
  for (let i = 0; i < length; i++) {
    const { start, end } = ranges[i]
    if (index > end) return false
    if (index >= start && index <= end) return true
  }
  return false
}
