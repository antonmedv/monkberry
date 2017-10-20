const path = require('path')

module.exports = {
  entry: path.join(__dirname, '/views/index.js'),
  output: {
    path: __dirname,
    filename: '_build.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.monk$/,
        use: {
          loader: 'monkberry-loader',
          options: {}
        }
      }
    ]
  },
  devtool: 'source-map'
}
