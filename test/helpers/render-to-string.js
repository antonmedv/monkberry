import {render} from 'monkberry'
import indentString from 'indent-string'

export const print = createPrint(true)
export const print2 = createPrint(false)

export function renderToString(vNode) {
  const root = document.createElement('div')

  render(vNode, root)

  return print2(root)
}

function createPrint(oneline = true) {
  const eol = oneline ? '' : '\n'
  const indent = oneline ? x => x : indentString

  const print = (node) => {
    switch (node.nodeType) {

      case Node.ELEMENT_NODE:
        const tag = node.nodeName.toLowerCase()
        const attrs = Array.from(node.attributes)
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' ')

        let html = `<${tag}${attrs}>${eol}`

        node = node.firstChild
        while (node) {
          html += indent(print(node), 2)
          node = node.nextSibling
        }

        html += `</${tag}>${eol}`

        return html

      case Node.TEXT_NODE:
        return `${node.textContent}${eol}`

      case Node.COMMENT_NODE:
        return `<!-- ${node.textContent} -->${eol}`

    }
  }

  return (node) => Array.from(node.children).map(print).join('\n')
}
