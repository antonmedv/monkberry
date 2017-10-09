import {render} from 'monkberry'
import indent from 'indent-string'

export function renderToString(vNode) {
  const root = document.createElement('div')

  render(vNode, root)

  return Array.from(root.children).map(print).join('\n')
}

function print(node) {
  switch (node.nodeType) {

    case Node.ELEMENT_NODE:
      const tag = node.nodeName.toLowerCase()
      const attrs = Array.from(node.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ')

      let html = `<${tag}${attrs}>\n`

      node = node.firstChild
      while (node) {
        html += indent(print(node), 2)
        node = node.nextSibling
      }

      html += `</${tag}>\n`

      return html

    case Node.TEXT_NODE:
      return `${node.textContent}\n`

  }
}
