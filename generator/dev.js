const build = require('./build')
const chokidar = require('chokidar')
const files = require('./files')
const http = require('http')
const mime = require('mime-types')
const path = require('path')
const tempDir = require('temp-dir')

module.exports = function (source, options = {}) {
  const port = options.hasOwnProperty('port') ? options.port : 8080
  const destination = path.resolve(tempDir, 'simple-docs', String(Date.now()) + String(Math.floor(Math.random() * 900000) + 100000))
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

    // attempt to load requested file
    const webPath = req.url.split('?')[0].replace(/\/+$/, '').replace(/^\//, '')
    const ext = path.extname(webPath.split('/').pop())
    console.log('> ' + webPath)
    const target = ext
      ? path.resolve(destination, webPath.split('/').join(path.sep))
      : path.resolve(destination, webPath.split('/').join(path.sep), 'index.html')
    const sent = await attemptSendFile(res, target)
    if (!sent && !ext) {
      const target = path.resolve(destination, webPath.split('/').join(path.sep) + '.html')
      const sent = await attemptSendFile(res, target)
      if (!sent) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    } else if (!sent) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  const watcher = chokidar.watch(source)
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
        process.stdout.write('Building')
        buildPromise = build(source, destination, options)
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

async function attemptSendFile (res, target) {
  try {
    console.log(target)
    const content = await files.readFile(target, 'utf8')
    const headers = {}
    const contentType = mime.lookup(target)
    if (contentType) headers['Content-Type'] = contentType
    res.writeHead(200, headers);
    res.end(content)
  } catch (err) {
    if (err.code === 'ENOENT') return false
    console.error(err.stack)
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
  return true
}
