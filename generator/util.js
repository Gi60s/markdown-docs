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
      ref += '-' + store[ref]
    }
    next.ref = ref

    root.all.push(next)
  }

  let parent = root;
  root.all.forEach(heading => {
    while (heading.level <= parent.level) parent = parent.parent;
    if (heading.level > parent.level) {
      heading.parent = parent;
      parent.children.push(heading);
      parent = heading;
    } else {
      parent.children.push(heading);
    }
  })

  return root
}

function removeMarkdownCode (content) {
  return content
    .replace(/```[\s\S]+?```/g, '')
    .replace(/`[\s\S]+?`/g, '')
}
