module.exports = {
  IfStatement: ({node, source, scope, compile}) => {
    node.reference = 'if' + scope.template.uniqid('placeholder')

    scope.template.declare(
      source`${node.reference} = document.createComment('if')`
    )

    scope.collectProps(node.cond)

    const expr = compile(node.cond)

    if (node.otherwise) {
      const then = scope.create()
      const otherwise = scope.create()

      then.template.setRoot(node.then.map(child => compile(child, then)))
      otherwise.template.setRoot(node.otherwise.map(child => compile(child, otherwise)))

      scope.addSpot(node.reference, source`
        [${expr} ? ${then.render()} : ${otherwise.render()}]
      `)
    } else {
      const then = scope.create()

      then.template.setRoot(node.then.map(child => compile(child, then)))

      scope.addSpot(node.reference, source`
        [${expr} && ${then.render()}]
      `)
    }

    return node.reference
  }
}
