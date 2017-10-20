const {createFilter} = require('rollup-pluginutils')
const {compile} = require('monkberry-compiler')
const path = require('path')

function plugin(options = {}) {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'monkberry',
    transform(code, id) {
      if (!filter(id)) return
      if (id.slice(-5) !== '.monk') return

      const node = compile(id, code)
      const output = node.toStringWithSourceMap()

      return {
        code: output.code,
        map: output.map
      }
    }
  }
}

module.exports = plugin
