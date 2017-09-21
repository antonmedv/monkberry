const {join} = require('./util')

module.exports = {
  Document: ({node, compile, scope, source, options}) => {
    const imports = source`${scope.getImports()}`

    const children = node.children.map(child => compile(child))
    scope.template.setRoot(children)

    const vNode = scope.render()

    let props = source``
    if (scope.props.size > 0) {
      props = source`{${[...scope.props]}}`
    }

    const body = source`
      const ${props} = props
      return ${vNode}
    `

    let renderFn
    if (options.name) {
      renderFn = source`
        const ${options.name} = (props) => {
          ${body}
        }
        
        export default ${options.name}
      `
    } else {
      renderFn = source`
        export default function (props) {
          ${body}
        }
      `
    }

    let templates = []

    const walk = scope => {
      templates.push(scope.template.render())
      scope.children.forEach(walk)
    }

    walk(scope)

    return source`
      import createVNode from 'monkberry'
      ${imports}
      
      ${renderFn}
      
      ${join(templates, '\n')}
    `
  }
}


