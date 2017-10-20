const {sourceNode} = require('./sourceNode')
const {collectVariables} = require('./variable')
const {isSingleChild, esc, notNull} = require('../utils')
const {Figure} = require('../figure')

module.exports = {
  ForStatement: ({parent, node, source, scope, compile}) => {
    node.reference = 'for' + scope.template.uniqid('placeholder')

    let templateName = scope.template.name + '_for' + scope.template.uniqid('template_name')

    scope.template.declare(
      source`${node.reference} = document.createComment('for')`
    )

    scope.collectProps(node.expr)

    const expr = compile(node.expr)

    {
      const subscope = scope.create()

      const {value, key} = node.options
      subscope.addSpot(
        node.reference,
        vNode => source`${expr}.map((${value} ${key ? `, ${key}` : ``}) => (${vNode}))`
      )
      subscope.addCurrentProps(key, value)

      const children = node.children.map(child => compile(child, subscope))
      subscope.template.setRoot(children)
    }

    return node.reference
  }
}
