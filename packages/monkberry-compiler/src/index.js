const parser = require('./parser')
const doCompile = require('./compiler')
const whitespace = require('./transform/whitespace')
const entity = require('./transform/entity')

function compile(file, code, options = {}) {
  const transforms = [whitespace, entity]
  const globals = [
    'window',
    'Array',
    'Object',
    'Math',
    'JSON'
  ].concat(options.globals || [])

  // Parse
  let ast = parser.parse(file, code)

  // Modify ast
  transforms.forEach(transform => transform(ast))

  // Compile
  return doCompile(ast, {globals})
}

module.exports = {compile, parser}
