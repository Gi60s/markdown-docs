const build = require('./build')
const chokidar = require('chokidar')
const files = require('./files')
const http = require('http')
const parseUrl = require('parseurl')
const path = require('path')
const readConfig = require('./read-config')
const tempDir = require('temp-dir')
const send = require('send')

/**
 * Start serving documentation in development mode
 * @param {string} source The directory containing markdown files to serve.
 * @param {object} [options]
 * @param {string} [options.configFilePath]
 * @param {string} [options.destination] The destination to build files to. Defaults to a temp directory.
 * @param {number} [options.port=8080] The port to serve files from.
 * @param {string} [options.template] The template to use to build.
 * @returns {{stop(): void}}
 */
module.exports = function (source, options = {}) {
  const configFilePath = options.configFilePath
    ? path.resolve(process.cwd(), options.configFilePath)
    : path.resolve(source, 'markdown-docs.js')
  const port = options.hasOwnProperty('port') ? options.port : 8080
  const destination = options.hasOwnProperty('destination')
    ? path.resolve(process.cwd(), options.destination)
    : path.resolve(tempDir, 'markdown-docs', String(Date.now()) + String(Math.floor(Math.random() * 900000) + 100000))
  const configPromise = readConfig(configFilePath)
  let buildPromise
  let buildPending = false
  let debounce

  const server = new http.createServer(async function (req, res) {
    const config = await configPromise

    // only GET requests allowed
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' })
      res.end('Method not allowed')
      return
    }

    let pathName = parseUrl(req).pathname
    if (!pathName.startsWith(config.site.basePath)) {
      res.writeHead(307, { 'Location': config.site.basePath })
      res.end()
      return
    }
    pathName = pathName.substring(config.site.basePath.length).replace(/\/$/, '')

    // if no extension on the path then check if there is an index.html file, then check if <path>.html file.
    if (!/\.\w+$/.test(pathName)) {
      const filePath = path.resolve(destination, pathName.split('/').join(path.sep).substring(1))
      if (await files.isFile(path.resolve(filePath, 'index.html'))) {
        pathName += '/index.html'
      } else if (await files.isFile(filePath + '.html')) {
        pathName += '.html'
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Page not found')
        return
      }
    }

    if (pathName.endsWith('.html')) res.setHeader('Cache-Control', 'no-store')
    send(req, pathName, { root: destination }).pipe(res)
  });

  let { template } = options
  if (!template) {
    template = path.resolve(__dirname, '..', 'templates', 'default')
  } else if (template.indexOf(path.sep) === -1) {
    template = path.resolve(__dirname, '..', 'templates', template)
  }
  const watcher = chokidar.watch([ source, template ])
  let watcherReady = false
  watcher
    .on('add', () => change())
    .on('change', () => change())
    .on('unlink', () => change())
    .on('ready', async () => {
      watcherReady = true
      change(0)
    })

  let listener
  async function start(port, isOriginalCall) {
    const config = await configPromise
    return new Promise((resolve, reject) => {
      listener = server.listen(port, function () {
        if (isOriginalCall) {
          const port = server.address().port
          const addr = port + config.site.basePath
          const log = [
            '='.repeat(17 + addr.length),
            'Server listening at:',
            '    http://localhost:' + addr,
            '    http://127.0.0.1:' + addr,
            '='.repeat(17 + addr.length)
          ]
          console.log(log.join('\n'))
          resolve()
        }
      })

      server.on('error', function (err) {
        if (err.code === 'EADDRINUSE' && port !== 0) {
          console.error('\nPort already in use: ' + port + '. A different port will be used.')
          start(0, false).then(resolve, reject)
        } else {
          reject(err)
        }
      })
    })
  }

  start(port, true).catch(err => console.error(err.stack))

  return {
    stop() {
      listener.close()
      watcher.close()
    }
  }

  // tell each client what patch changed
  function change (debounceDelay = 300) {
    clearTimeout(debounce)
    if (!buildPending && !buildPromise) {
      debounce = setTimeout(function () {
        const time = Date.now()
        console.log('[' + (new Date().toLocaleTimeString()) + '] Building...')
        buildPromise = build(source, destination, Object.assign({}, options, { isLocal: true }))
          .then(success => {
            if (success) {
              console.log('[' + (new Date().toLocaleTimeString()) + '] Build completed in ' + (Date.now() - time) + ' milliseconds\n')
            } else {
              console.log('[' + (new Date().toLocaleTimeString()) + '] Build failed')
            }
            return success
          })
          .catch(err => {
            console.log('[' + (new Date().toLocaleTimeString()) + '] Build failed')
            console.error(err.stack)
            return false
          })
          .then(data => {
            buildPromise = null
            return data
          })
      }, debounceDelay)
    } else if (buildPromise) {
      buildPending = true
      buildPromise
        .then(() => {
          buildPending = false
          change(0)
        })
        .catch(() => {})
    }
  }
}
