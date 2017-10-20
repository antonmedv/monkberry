module.exports = {
  ForStatement: ({node, source, scope, compile}) => {
    node.reference = 'for' + scope.template.uniqid('placeholder')

    scope.template.declare(
      source`${node.reference} = document.createComment('for')`
    )
    scope.collectProps(node.expr)

    const expr = compile(node.expr)
    const subscope = scope.create()
    const {value, key} = node.options

    subscope.addCurrentProps(key, value)
    subscope.template.setRoot(node.children.map(child => compile(child, subscope)))

    scope.addSpot(node.reference, source`
      ${expr}.map((${value} ${key ? `, ${key}` : ``}) => (${subscope.render()}))
    `)

    return node.reference
  }
}
