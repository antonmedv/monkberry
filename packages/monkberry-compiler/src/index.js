const parser = require('./parser')
const compile = require('./compiler')

class Compiler {
  constructor(options = {}) {
    this.transforms = [/*whitespace, entity*/]
    this.globals = []
  }

  compile(filename, code) {
    let ast = parser.parse(filename, code)

    // Modify ast
    this.transforms.forEach(transform => transform(ast))

    const globals = [
      'window',
      'Array',
      'Object',
      'Math',
      'JSON'
    ].concat(this.globals)

    return compile(ast, {globals})
  }
}

module.exports = Compiler
