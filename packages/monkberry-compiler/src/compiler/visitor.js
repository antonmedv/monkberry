function visit(node, visitor) {
  if (node.type in visitors) {
    visitors[node.type](node, visitor)
  } else {
    throw new Error(`Unknown node type "${node.type}".`)
  }
}

function handle(node, visitor) {
  if (node.type in visitor) {
    visitor[node.type](node)
  }
}

const visitors = {
  Document: (node, visitor) => {
    handle(node, visitor)

    for (let i = 0; i < node.children.length; i++) {
      visit(node.children[i], visitor)
    }
  },
  Text: (node, visitor) => {
    handle(node, visitor)
  },
  Comment: (node, visitor) => {
    handle(node, visitor)
  },
  Element: (node, visitor) => {
    handle(node, visitor)

    for (let i = 0; i < node.attributes.length; i++) {
      visit(node.attributes[i], visitor)
    }

    for (let i = 0; i < node.children.length; i++) {
      visit(node.children[i], visitor)
    }
  },
  Attribute: (node, visitor) => {
    handle(node, visitor)

    if (node.body) {
      for (let i = 0; i < node.children.length; i++) {
        visit(node.children[i], visitor)
      }
    }
  },
  SpreadAttribute: (node, visitor) => {
    handle(node, visitor)
    visit(node.identifier, visitor)
  },
  Directive: (node, visitor) => {
    handle(node, visitor)

    if (node.body) {
      for (let i = 0; i < node.body.length; i++) {
        visit(node.body[i], visitor)
      }
    }
  },
  ExpressionStatement: (node, visitor) => {
    handle(node, visitor)
    visit(node.expression, visitor)
  },
  ImportStatement: (node, visitor) => {
    handle(node, visitor)
  },
  IfStatement: (node, visitor) => {
    handle(node, visitor)

    visit(node.cond, visitor)

    for (let i = 0; i < node.then.length; i++) {
      visit(node.then[i], visitor)
    }

    if (node.otherwise) {
      for (let i = 0; i < node.otherwise.length; i++) {
        visit(node.otherwise[i], visitor)
      }
    }
  },
  ForStatement: (node, visitor) => {
    handle(node, visitor)

    visit(node.expr, visitor)

    for (let i = 0; i < node.children.length; i++) {
      visit(node.children[i], visitor)
    }
  },
  BlockStatement: (node, visitor) => {
    handle(node, visitor)

    for (let i = 0; i < node.body.length; i++) {
      visit(node.body[i], visitor)
    }
  },
  UnsafeStatement: (node, visitor) => {
    handle(node, visitor)
  },
  FilterExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.callee, visitor)
    let args = node.arguments

    for (let i = 0, len = args.length; i < len; i++) {
      visit(args[i], visitor)
    }
  },
  ArrayExpression: (node, visitor) => {
    handle(node, visitor)

    let elements = node.elements

    for (let i = 0, len = elements.length; i < len; i++) {
      visit(elements[i], visitor)
    }
  },
  ObjectExpression: (node, visitor) => {
    handle(node, visitor)

    let i, j, properties = node.properties

    for (i = 0, len = properties.length; i < len; i++) {
      let prop = properties[i]
      let kind = prop.kind
      let key = prop.key
      let value = prop.value

      if (kind === "init") {
        visit(key, visitor)
        visit(value, visitor)
      } else {
        let params = value.params
        let body = value.body

        visit(key, visitor)

        for (j = 0, plen = params.length; j < plen; j++) {
          visit(params[j], visitor)
        }

        for (j = 0, blen = body.length; j < blen; j++) {
          visit(body[j], visitor)
        }
      }
    }
  },
  SequenceExpression: (node, visitor) => {
    handle(node, visitor)

    let expressions = node.expressions

    for (let i = 0, len = expressions.length; i < len; i++) {
      visit(expressions[i], visitor)
    }
  },
  UnaryExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.argument, visitor)
  },
  BinaryExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.left, visitor)
    visit(node.right, visitor)
  },
  AssignmentExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.left, visitor)
    visit(node.right, visitor)
  },
  UpdateExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.argument, visitor)
    visit(node.argument, visitor)
  },
  LogicalExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.left, visitor)
    visit(node.right, visitor)
  },
  ConditionalExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.test, visitor)
    visit(node.consequent, visitor)
    visit(node.alternate, visitor)
  },
  NewExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.callee, visitor)
    let args = node.arguments

    if (args !== null) {
      for (let i = 0, len = args.length; i < len; i++) {
        visit(args[i], visitor)
      }
    }
  },
  CallExpression: (node, visitor) => {
    handle(node, visitor)

    visit(node.callee, visitor)
    let args = node.arguments

    for (let i = 0, len = args.length; i < len; i++) {
      visit(args[i], visitor)
    }
  },
  MemberExpression: (node, visitor) => {
    handle(node, visitor)
    visit(node.object, visitor)
    visit(node.property, visitor)
  },
  ThisExpression: (node, visitor) => {
    handle(node, visitor)
  },
  Identifier: (node, visitor) => {
    handle(node, visitor)
  },
  Accessor: (node, visitor) => {
    handle(node, visitor)
  },
  Literal: (node, visitor) => {
    handle(node, visitor)
  }
}

module.exports = visit
