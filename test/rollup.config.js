const monkberry = require('monkberry-rollup')
const path = require('path')

module.exports = {
  input: path.join(__dirname, '/views/index.js'),
  output: {
    file: path.join(__dirname, '/_build.js'),
    format: 'cjs'
  },
  plugins: [
    monkberry()
  ]
}
