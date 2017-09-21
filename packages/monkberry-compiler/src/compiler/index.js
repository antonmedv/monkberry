const Scope = require('./scope')
const sourceNode = require('./sourceNode')
const document = require('./document')
const element = require('./element')
const attribute = require('./attribute')
const directive = require('./directive')
const expression = require('./expression')
const text = require('./text')
const comment = require('./comment')
const import_ = require('./import')
const cond = require('./cond')
const loop = require('./loop')
const unsafe = require('./unsafe')

const compilers = Object.assign({},
  document,
  element,
  attribute,
  directive,
  expression,
  text,
  comment,
  import_,
  cond,
  loop,
  unsafe
)

function compile(ast, options = {}) {
  const scope = new Scope()
  return next(null, ast, scope, options)
}

function next(parent, node, scope, options) {
  let path = {
    parent,
    node,
    scope,
    options,
    source: createSource(node.loc),
    compile: (child, subscope = scope) => next(node, child, subscope, options)
  }

  if (node.type in compilers) {
    return compilers[node.type](path)
  } else {
    throw new Error(`Unknown node type "${node.type}".`)
  }
}

function createSource(loc) {
  return (codes, ...nodes) => {
    const root = sourceNode(loc, '')
    for (let i = 0; i < codes.length; i++) {
      root.add(sourceNode(loc, codes[i]))
      if (nodes && nodes[i]) {
        if (Array.isArray(nodes[i])) {
          /*
           We filter nodes[i] for undefined because some of compilers
           (i.e. import compiler) may not return anything
          */
          root.add(sourceNode(loc, nodes[i].filter(node => !!node)).join(', '))
        } else {
          root.add(nodes[i])
        }
      }
    }
    return root
  }
}

module.exports = compile
