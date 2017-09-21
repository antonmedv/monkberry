const path = require('path')
const fs = require('fs')
const {minify} = require('uglify-js')
const gzipSize = require('gzip-size')
const prettyBytes = require('pretty-bytes')

const code = fs.readFileSync(
  path.join(__dirname, '../packages/monkberry/monkberry.js')
).toString()
const options = {
  toplevel: true,
  compress: {
    global_defs: {
      '@process.env.NODE_ENV': '"production"'
    },
    passes: 2
  },
  output: {
    beautify: false
  }
}
const result = minify(code, options)
const size = gzipSize.sync(result.code)

if (process.argv[2] == '-') {
  console.log(result.code)
} else {
  console.log(prettyBytes(size))
}
