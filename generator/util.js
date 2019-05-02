'use strict'

module.exports = {
  getMarkdownHeadings,
  removeMarkdownCode
}

function getMarkdownHeadings (content) {
  const root = { level: 0, all: [], children: [] }
  const rxHeadings = /(?:^(#{1,6}) +([\s\S]+?)$|^(\S+)(?:\r\n|\r|\n)([=-])+$)/gm
  const store = []

  content = removeMarkdownCode(content)

  let match
  let last = root
  while ((match = rxHeadings.exec(content))) {
    const next = {
      children: [],
      level: match[4]
        ? match[4] === '=' ? 1 : 2
        : match[1].length,
      title: (match[2] || match[3]).trim()
    }

    let ref = next.title
      .toLowerCase()
      .replace(/ +/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-{2,}/g, '-')
    if (!store.hasOwnProperty(ref)) {
      store[ref] = 0
    } else {
      store[ref]++
      ref += store[ref]
    }
    next.ref = ref

    if (next.level > last.level) {
      next.parent = last
      last.children.push(next)
      root.all.push(next)
    } else if (next.level === last.level) {
      next.parent = last.parent
      next.parent.children.push(next)
      root.all.push(next)
    } else {
      let p = last.parent
      while (p.level < next.level && p.parent) p = p.parent
      next.parent = p.parent || root
      next.parent.children.push(next)
      root.all.push(next)
    }

    last = next
  }

  return root
}

function removeMarkdownCode (content) {
  return content
    .replace(/```[\s\S]+?```/g, '')
    .replace(/`[\s\S]+?`/g, '')
}
