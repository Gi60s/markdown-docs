'use strict'

module.exports = function () {
  const store = {}
  let hasErrors = false
  return {
    add (filePath, message) {
      if (!store[filePath]) store[filePath] = []
      store[filePath].push(message)
      hasErrors = true
    },
    hasErrors () { return hasErrors },
    report (prefix) {
      let str = prefix
      const filePaths = Object.keys(store)
      filePaths.sort()
      filePaths.forEach(filePath => {
        str += '\n\n  ' + filePath + '\n    ' + store[filePath].join('\n    ')
      })
      return str + '\n'
    }
  }
}
