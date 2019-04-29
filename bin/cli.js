#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const program = require('commander')

const commandsDirectory = path.resolve(__dirname, '..', 'commands')
fs.readdirSync(commandsDirectory)
  .filter(filename => /\.js$/.test(filename))
  .forEach(filename => {
    const command = require(path.join(commandsDirectory, filename))
    command(program)
  })

program.command('*')
  .action((env) => {
    if (env.length) console.error('Invalid command: ' + env + '\n')
    program.help()
  })

if (process.argv.length <= 2) process.argv[2] = ''
program.parse(process.argv)
