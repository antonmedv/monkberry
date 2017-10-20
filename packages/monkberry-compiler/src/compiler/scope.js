const visit = require('./visitor')
const {join} = require('./util')
const sourceNode = require('./sourceNode')
const Template = require('./template')

class Scope {
  constructor(parent = null) {
    this.parent = parent
    this.spots = []
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
      this.renderProps(),
      this.renderSpots(),
      `}`
    ])
  }

  renderProps() {
    if (this.currentProps.size > 0) {
      return sourceNode([
        `props: Object.assign({}, props, {${join([...this.currentProps], ', ')}}),`
      ])
    } else {
      return sourceNode(`props,`)
    }
  }

  renderSpots() {
    if (this.spots.length > 0) {
      return sourceNode([
        `spots: [`,
        join(this.spots, ',\n'),
        `],`
      ])
    } else {
      return sourceNode(``)
    }
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

  addCurrentProps(...props) {
    for (let prop of props) {
      if (prop) {
        this.currentProps.add(prop)
      }
    }
  }

  addSpot(spot, code) {
    this.template.addSpot(spot)
    this.spots.push(code)
  }

  has(variable) {
    if (!this.vars.has(variable)) {
      return this.parent ? this.parent.has(variable) : false
    }
    return true
  }
}

module.exports = Scope
