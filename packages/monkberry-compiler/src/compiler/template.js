const sourceNode = require('./sourceNode')
const {join} = require('./util')

let index = 0

class Template {
  constructor() {
    this.name = 'template' + index++
    this.root = ''
    this.spots = []
    this.declarations = []
    this.constructions = []
    this.props = new Set()
    this.updaters = []
    this.counters = {}
  }

  render() {
    const s = sourceNode(`function ${this.name}() {`)

    s.add([
      `  const  
      `,
      join(this.declarations, ','),
      `;
      
      `
    ])

    s.add(
      join(this.constructions, '\n')
    )

    s.add(`
    
      return {
    `)

    s.add(`root: [`)
    s.add(this.root)
    s.add(`],`)

    if (this.spots.length > 0) {
      s.add(`spots: [`)
      for (let spot of this.spots) {
        s.add(spot)
        s.add(',')
      }
      s.add(`],`)
    }

    if (this.props.size > 0) {
      s.add([
        `update({`, join([...this.props], ','), `}) {`, join(this.updaters, '\n'), `}`
      ])
    } else {
      s.add([
        `update() {`, join(this.updaters, '\n'), `}`
      ])
    }

    s.add(`
        }
      }
    `)
    return s
  }

  declare(node) {
    this.declarations.push(node)
  }

  construct(node) {
    this.constructions.push(node)
  }

  updater(node) {
    this.updaters.push(node)
  }

  addProps(...props) {
    props.forEach(prop => this.props.add(prop))
  }

  setRoot(children) {
    if (children.length > 1) {
      this.declare(
        sourceNode(`root = document.createElement('span')`)
      )
      for (let child of children) {
        this.construct(
          sourceNode(`root.appendChild(${child})`)
        )
      }
      this.root = sourceNode('root')
    } else {
      this.root = sourceNode(children[0])
    }
  }

  addSpot(spot) {
    this.spots.push(spot)
  }

  uniqid(name = 'default') {
    if (!this.counters[name]) {
      this.counters[name] = 0
    }
    return this.counters[name]++
  }
}

module.exports = Template
