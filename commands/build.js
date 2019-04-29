'use strict'
const build = require('../generator/build')

module.exports = function (program) {
  program
    .command('build <src-dir> <out-dir>')
    .description('Build documentation from markdown.')
    .option('-c, --config <path>', 'The path to the configuration file that will be used to build your documentation.')
    .option('-t, --template <path>', 'The path to a template to use. Defaults to using the built in default template.')
    .action(async (srcDir, outDir, command) => {
      const options = {}
      if (command.config) options.config = command.config
      if (command.template) options.template = command.template
      return build(srcDir, outDir, options)
    })
}
