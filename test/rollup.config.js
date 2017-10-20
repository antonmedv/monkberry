const monkberry = require('monkberry-rollup')

module.exports = {
  input: './views/index.js',
  output: {
    file: './_build.js',
    format: 'cjs'
  },
  plugins: [
    monkberry()
  ]
}
