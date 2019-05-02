'use strict'
const files = require('../generator/files')
const path = require('path')

module.exports = function (program) {
  program
    .command('create-template <out-dir>')
    .description('Create new template by copying the built in default template to the specified output directory')
    .action(async (outDir) => {
      const fullPath = path.resolve(process.cwd(), outDir)
      await files.copy(path.resolve(__dirname, '..', 'templates', 'default'), fullPath)
    })
}
