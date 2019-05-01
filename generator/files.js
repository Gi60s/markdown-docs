'use strict'
const fs = require('fs')
const path = require('path')
const util = require('util')

const files = module.exports = {
  copy,
  eachFile,
  ensureDirectoryExists,
  isDirectory,
  isFile,
  mkdir: util.promisify(fs.mkdir),
  readdir: util.promisify(fs.readdir),
  readFile: util.promisify(fs.readFile),
  rmDir,
  stat: util.promisify(fs.stat),
  unlink: util.promisify(fs.unlink),
  writeFile: util.promisify(fs.writeFile)
}

const copyFile = util.promisify(fs.copyFile)
const removeDir = util.promisify(fs.rmdir)

async function copy (source, dest, filter) {
  if (!filter || filter(source)) {
    const stats = await files.stat(source)
    if (stats.isFile()) {
      return copyFile(source, dest)
    } else if (stats.isDirectory()) {
      const fileNames = await files.readdir(source)
      await files.ensureDirectoryExists(dest)
      const promises = fileNames.map(fileName => copy(path.resolve(source, fileName), path.resolve(dest, fileName), filter))
      return Promise.all(promises)
    }
  }
}

async function eachFile (filePath, handler) {
  const stats = await files.stat(filePath)
  if (stats.isDirectory()) {
    const fileNames = await files.readdir(filePath)
    const promises = fileNames.map(fileName => eachFile(path.resolve(filePath, fileName), handler))
    return Promise.all(promises).then(() => {})
  } else if (stats.isFile()) {
    if (handler.length > 1) {
      const content = await files.readFile(filePath, 'utf8')
      return handler(filePath, content)
    } else {
      return handler(filePath)
    }
  }
}

async function ensureDirectoryExists (path) {
  let stats
  try {
    stats = await files.stat(path)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return files.mkdir(path, { recursive: true })
    } else {
      throw err
    }
  }

  if (!stats.isDirectory()) throw Error('Cannot make directory because the path already exists for a non-directory: ' + path)
}

async function isDirectory (path) {
  let stats
  try {
    stats = await files.stat(path)
    return stats.isDirectory()
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    } else {
      throw err
    }
  }
}

async function isFile (path) {
  let stats
  try {
    stats = await files.stat(path)
    return stats.isFile()
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    } else {
      throw err
    }
  }
}

async function rmDir (dirPath) {
  try {
    await files.stat(dirPath)
  } catch (err) {
    if (err.code === 'ENOENT') return
  }

  const filesNames = await files.readdir(dirPath)
  const promises = filesNames.map(async fileName => {
    const fullPath = path.resolve(dirPath, fileName)
    const stats = await files.stat(fullPath)
    if (stats.isDirectory()) {
      await rmDir(fullPath)
      await removeDir(fullPath)
    } else {
      await files.unlink(fullPath)
    }
  })
  return await Promise.all(promises)
}
