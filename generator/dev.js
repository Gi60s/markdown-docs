const build = require('./build')
const chokidar = require('chokidar')
const files = require('./files')
const http = require('http')
const parseUrl = require('parseurl')
const path = require('path')
const tempDir = require('temp-dir')
const send = require('send')

/**
 * Start serving documentation in development mode
 * @param {string} source The directory containing markdown files to serve.
 * @param {object} [options]
 * @param {string} [options.config]
 * @param {string} [options.destination] The destination to build files to. Defaults to a temp directory.
 * @param {number} [options.port=8080] The port to serve files from.
 * @param {string} [options.template] The template to use to build.
 * @returns {{stop(): void}}
 */
module.exports = function (source, options = {}) {
  const port = options.hasOwnProperty('port') ? options.port : 8080
  const destination = options.hasOwnProperty('destination')
    ? path.resolve(process.cwd(), options.destination)
    : path.resolve(tempDir, 'markdown-docs', String(Date.now()) + String(Math.floor(Math.random() * 900000) + 100000))
  let buildPromise
  let buildPending = false
  let debounce

  const server = new http.createServer(async function (req, res) {
    // only GET requests allowed
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method not allowed');
      return
    }

    // if no extension on the path then check if there is an index.html file, then check if <path>.html file.
    let pathName = parseUrl(req).pathname
    if (!/\.\w+$/.test(pathName)) {
      const filePath = path.resolve(destination, pathName.split('/').join(path.sep).substring(1))
      if (await files.isFile(path.resolve(filePath, 'index.html'))) {
        pathName += '/index.html'
      } else if (await files.isFile(filePath + '.html')) {
        pathName += '.html'
      }
    }

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

  const listener = server.listen(port, function (err) {
    if (err) {
      console.error(err.stack)
    } else {
      console.log('Server listening on port ' + server.address().port)
    }
  });

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
        process.stdout.write('[' + (new Date().toLocaleTimeString()) + '] Building')
        buildPromise = build(source, destination, Object.assign({}, options, { isLocal: true }))
          .then(data => {
            process.stdout.write(' completed in ' + (Date.now() - time) + ' milliseconds\n')
            return data
          })
          .catch(err => {
            process.stdout.write(' failed')
            console.error(err.stack)
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
