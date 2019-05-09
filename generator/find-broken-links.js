'use strict'
const util = require('./util')
const files = require('./files')
const path = require('path')

const rxExternalLink = /^https?:\/\//
const rxMarkdownFile = /\.md$/i

module.exports = async function (configFilePath, filePath, fileWarning) {
  const store = await getHeadings(filePath, filePath, {})
  await files.eachFile(filePath, function (filePath) {
    if (!rxMarkdownFile.test(filePath) && filePath !== configFilePath) store[filePath] = null
  })
  return findBrokenLinks(filePath, filePath, store, fileWarning)
}

async function getHeadings (filePath, rootPath, store) {
  const stats = await files.stat(filePath)
  if (stats.isDirectory()) {
    const fileNames = await files.readdir(filePath)
    const promises = fileNames.map(async fileName => {
      const fullPath = path.resolve(filePath, fileName)
      return getHeadings(fullPath, rootPath, store)
    })
    return Promise.all(promises).then(() => store)
  } else if (stats.isFile() && path.extname(filePath).toLowerCase() === '.md') {
    const content = util.removeMarkdownCode(await files.readFile(filePath, 'utf8'))
    store[filePath] = {}
    util.getMarkdownHeadings(content, 6).all.forEach(item => {
      store[filePath][item.ref] = item
    })
    if (path.basename(filePath).toLowerCase() === 'index.md') store[path.dirname(filePath)] = store[filePath]
  }
  return store
}

async function findBrokenLinks (filePath, rootPath, existing, fileWarning) {
  const stats = await files.stat(filePath)
  if (stats.isDirectory()) {
    const fileNames = await files.readdir(filePath)
    const promises = fileNames.map(async fileName => {
      const fullPath = path.resolve(filePath, fileName)
      return findBrokenLinks(fullPath, rootPath, existing, fileWarning)
    })
    return Promise.all(promises)
  } else if (stats.isFile() && path.extname(filePath).toLowerCase() === '.md') {
    const content = util.removeMarkdownCode(await files.readFile(filePath, 'utf8'))
    const filePathDir = path.dirname(filePath)
    const rxLinks = /(\[[^\]]+?]) *(: *([\s\S]+?)$|\(([\s\S]+?)\))/gm
    let match
    while ((match = rxLinks.exec(content))) {
      const link = match[3] || match[4]
      if (!rxExternalLink.test(link)) {
        const [ external, internal ] = link.split('#')
        const refFilePath = external
          ? external[0] === '/'
            ? path.resolve(rootPath, external.substring(1))
            : path.resolve(filePathDir, external.split('/').join(path.sep))
          : filePath
        if (!existing.hasOwnProperty(refFilePath)) {
          fileWarning(filePath, 'References a file that does not exist: ' + refFilePath)
        } else if (internal && !existing[refFilePath].hasOwnProperty(internal)) {
          fileWarning(filePath, 'References the heading "' + internal + '" that does not exist in: ' + refFilePath)
        }
      }
    }
  }
}
