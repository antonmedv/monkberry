const loaderUtils = require('loader-utils')
const {compile} = require('monkberry-compiler')

module.exports = function (content) {
  this.cacheable()
  const options = Object.assign({}, loaderUtils.getOptions(this))

  let node

  try {
    node = compile(this.resourcePath, content, options)
  } catch (error) {
    this.emitError(error.message)
    return ''
  }

  const output = node.toStringWithSourceMap()
  output.map.setSourceContent(this.resourcePath, content)

  this.callback(null, output.code, output.map.toJSON())
}
