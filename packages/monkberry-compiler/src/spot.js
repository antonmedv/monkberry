const {unique} = require('./utils')
const {sourceNode} = require('./compiler/sourceNode')

class Spot {
  constructor(variables) {
    this.variables = unique(variables).sort()
    this.reference = this.variables.join('_')
    this.declaredVariables = {}
    this.operators = []
    this.length = this.variables.length
    this.cache = false
    this.onlyFromLoop = false
  }

  generate() {
    let sn = sourceNode(
      `function (${this.variables.join(`, `)}) {\n`
    )

    Object.keys(this.declaredVariables).forEach(name => {
      sn.add(`      var ${name};\n`)
    })

    if (this.operators.length > 0) {
      sn.add(sourceNode(this.operators).join(';\n')).add(';\n')
    }

    sn.add('    }')

    return sn
  }

  add(code) {
    this.operators.push(code)
    return this
  }

  declareVariable(name) {
    this.declaredVariables[name] = true
    return this
  }
}

module.exports = {Spot}
