module.exports = {
  Element: ({node, compile, source ,scope}) => {
    node.reference = node.name + scope.template.uniqid()

    scope.template.declare(
      source`${node.reference} = document.createElement('${node.name}')`
    )

    const children = node.children.map(child => compile(child))

    for (let child of children) {
      if (child) {
        scope.template.construct(
          source`${node.reference}.appendChild(${child})`
        )
      }
    }

    node.attributes.map(attr => compile(attr))

    return node.reference
  }
}
