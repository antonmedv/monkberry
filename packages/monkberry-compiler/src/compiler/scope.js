const visit = require('./visitor')
const {join} = require('./util')
const sourceNode = require('./sourceNode')
const Template = require('./template')

class Scope {
  constructor(parent = null) {
    this.parent = parent
    this.expr = _ => _
    this.children = []
    this.imports = []
    this.template = new Template()
    this.props = new Set()
    this.currentProps = new Set()
    this.vars = new Set()
  }

  render() {
    return sourceNode([
      `{`,
      `type: ${this.template.name},`,
      this.currentProps.size > 0
        ? `props: Object.assign({}, props, {${join([...this.currentProps], ', ')}})`
        : `props,`,
      this.children.length > 0 ? `spots: [${this.renderChildren()}],` : ``,
      `}`
    ])
  }

  renderChildren() {
    return this.children.map(scope => sourceNode([
      `{`,
      `keyed: false,`,
      `children:`,
      scope.expr(scope.render()),
      `}`
    ]))
  }

  create() {
    const sub = new Scope(this)
    this.children.push(sub)
    return sub
  }

  add(...vars) {
    vars.forEach(x => this.vars.add(x))
  }

  getImports() {
    return this.imports.join('\n')
  }

  findIdentifiers(node) {
    const vars = []
    if (node) {
      const nodes = [].concat(node)
      nodes.forEach(node => {
        visit(node, {
          Identifier: (node) => {
            vars.push(node.name)
          }
        })
      })
    }
    return vars
  }

  collectProps(node) {
    const props = this.findIdentifiers(node)
    this.addProps(...props)
  }

  addProps(...props) {
    for (let prop of props) {
      if (!this.vars.has(prop)) {
        if (this.parent) {
          this.parent.addProps(prop)
        } else {
          this.props.add(prop)
        }
      }
    }
  }

  addSpot(spot, fn) {
    this.parent.template.addSpot(spot)
    this.expr = fn
  }

  addCurrentProps(...props) {
    for (let prop of props) {
      this.currentProps.add(prop)
    }
  }
}

module.exports = Scope
