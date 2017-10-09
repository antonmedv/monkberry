const loaderUtils = require('loader-utils')
const Compiler = require('monkberry-compiler')

module.exports = function (content) {
  this.cacheable()
  const options = Object.assign({}, loaderUtils.getOptions(this))

  const compiler = new Compiler()

  if (options.globals) {
    compiler.globals = options.globals
  }

  let node

  try {
    node = compiler.compile(this.resourcePath, content)
  } catch (error) {
    this.emitError(error.message)
    return ''
  }

  const output = node.toStringWithSourceMap()
  output.map.setSourceContent(this.resourcePath, content)

  this.callback(null, output.code, output.map.toJSON())
}
