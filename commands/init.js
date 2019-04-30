'use strict'
const { dev, init } = require('../generator')

module.exports = function (program) {
  program
    .command('init <src-dir>')
    .description('Initialize new documentation')
    .option('-s, --serve', 'Use this flag to start serving the new static site after initializing it.')
    .action(async (srcDir, command) => {
      await init(srcDir)
      if (command.serve) await dev(srcDir)
    })
}
