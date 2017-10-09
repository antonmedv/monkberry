const path = require('path')

module.exports = {
  entry: path.join(__dirname, '/views/index.js'),
  output: {
    path: path.resolve(__dirname, '_build'),
    filename: 'index.js',
    library: 'views',
    libraryTarget: 'umd'
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
