'use strict'
const dev = require('../generator/dev')

module.exports = function (program) {
  program
    .command('dev <src-dir>')
    .description('Begin developing documentation.')
    .option('-c, --config <path>', 'The path to the configuration file that will be used to build your documentation.')
    .option('-d, --destination <path>', 'Where to build documentation to while developing. Defaults to using a temporary directory.')
    .option('-p, --port <port>', 'The port to serve the documentation on. Defaults to 8080')
    .option('-t, --template <path>', 'The path to a template to use. Defaults to using the built in default template.')
    .action(async (srcDir, command) => {
      const options = {}
      if (command.config) options.config = command.config
      if (command.destination) options.destination = command.destination
      if (command.port) options.port = command.port
      if (command.template) options.template = command.template
      const { stop } = await dev(srcDir, options)
      console.log('Press Ctrl+C to exit')
    })
}
