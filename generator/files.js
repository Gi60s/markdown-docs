'use strict'
const fs = require('fs')
const path = require('path')
const util = require('util')

const files = module.exports = {
  copy,
  ensureDirectoryExists,
  isDirectory,
  isFile,
  mkdir: util.promisify(fs.mkdir),
  readdir: util.promisify(fs.readdir),
  readFile: util.promisify(fs.readFile),
  stat: util.promisify(fs.stat),
  writeFile: util.promisify(fs.writeFile)
}

const copyFile = util.promisify(fs.copyFile)

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
