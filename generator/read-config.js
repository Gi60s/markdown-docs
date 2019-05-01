'use strict'

module.exports = function (configFilePath) {
  try {
    delete require.cache[configFilePath]
    const config = require(configFilePath)

    if (!config.site) config.site = {}
    config.site.basePath = config.site.url
      ? '/' + config.site.url.replace(/^https?:\/\/[\s\S]+?(?:\/|$)/, '').replace(/\/+/, '')
      : ''
    config.site.navigation = config.site.hasOwnProperty('navigation') ? config.site.navigation : true

    return config

  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw Error('Missing required configuration file: ' + configFilePath)
    } else {
      throw err
    }
  }
}
