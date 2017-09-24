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

    figure.declare(sourceNode(`var ${childrenName} = new Monkberry.Map();`))

    // for (

    let variablesOfExpression = collectVariables(figure.getScope(), node.expr)

    figure.thisRef = true
    figure.spot(variablesOfExpression).add(
      sourceNode(node.loc, [
        `      Monkberry.loop(_this, ${placeholder}, ${childrenName}, ${templateName}, `,
        compile(node.expr),
        (node.options === null ? `` : [`, `, esc(node.options)]),
        `)`
      ])
    )


    // ) {

    let subfigure = new Figure(templateName, figure)

    if (node.body.length > 0) {
      subfigure.children = node.body.map((node) => compile(node, subfigure)).filter(notNull)
      figure.addFigure(subfigure)
      subfigure.stateNeed = true
    }

    figure.addOnUpdate(
      node.options === null ?
        sourceNode(node.loc, [
          `    ${childrenName}.forEach(function (view) {\n`,
          `      view.update(view.__state__);\n`,
          `    });`
        ]) :
        // TODO: Remove double update on foreach.
        // Simple solution is to use Object.assign({}, __data__, view.__state__),
        // But this isn't supported in a lot of browsers for now.
        // Also i have solution for this what may come in next v5 version...
        sourceNode(node.loc, [
          `    ${childrenName}.forEach(function (view) {\n`,
          `      view.update(view.__state__);\n`,
          `      view.update(__data__);\n`,
          `      view.update(view.__state__);\n`,
          `    });`
        ])
    )

    if (node.options && node.options.value) {
      subfigure.spot(node.options.value).onlyFromLoop = true
    }

    if (node.options && node.options.key) {
      subfigure.spot(node.options.key).onlyFromLoop = true
    }

    // }

    return node.reference
  }
}
