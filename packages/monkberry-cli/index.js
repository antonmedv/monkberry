const chalk = require('chalk')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const prettier = require('prettier')
const PrettyError = require('pretty-error')
const columnify = require('columnify')
const upperCamelCase = require('uppercamelcase')
const {compile, parser} = require('monkberry-compiler')

exports.render = function (options, emitter) {
  const destination = options.dest
  const sourceMap = destination + '.map'
  const stdin = options.stdin

  const success = (result) => {
    let todo = 1
    const done = () => {
      if (--todo <= 0) {
        emitter.emit('done')
      }
    }

    if (!destination || stdin) {
      emitter.emit('log', result.code.toString())
      return done()
    }

    emitter.emit('warn', chalk.green('Compiling Complete, saving .js file...'))

    mkdirp(path.dirname(destination), (err) => {
      if (err) {
        return emitter.emit('error', chalk.red(err))
      }

      fs.writeFile(destination, result.code.toString(), (err) => {
        if (err) {
          return emitter.emit('error', chalk.red(err))
        }

        emitter.emit('warn', chalk.green('Wrote JS to ' + destination))
        emitter.emit('write', err, destination, result.code.toString())
        done()
      })
    })

    if (options.sourceMap) {
      todo++
      mkdirp(path.dirname(sourceMap), (err) => {
        if (err) {
          return emitter.emit('error', chalk.red(err))
        }
        fs.writeFile(sourceMap, result.map, (err) => {
          if (err) {
            return emitter.emit('error', chalk.red('Error' + err))
          }

          emitter.emit('warn', chalk.green('Wrote Source Map to ' + sourceMap))
          emitter.emit('write-source-map', err, sourceMap, result.map)
          done()
        })
      })
    }

    emitter.emit('render', result.code.toString())
  }

  const error = (err) => {
    emitter.emit('error', chalk.red(err))
  }

  try {
    let file, filename, code, sourceMap, sourcePath, sourceMapPath

    if (options.sourceMap) {
      sourceMap = true
    }

    if (stdin && options.data) {
      code = options.data
    } else if (options.src) {
      file = options.src
      filename = path.basename(file)
      code = fs.readFileSync(file, {encoding: 'utf8'})
    }

    if (options.dest) {
      sourcePath = path.join(path.relative(path.dirname(options.dest), path.dirname(options.src)), filename)
      sourceMapPath = path.basename(options.dest + '.map')
    }

    let output
    if (options.lex) {
      const lex = parser.lex(code)
      output = {
        code: columnify(lex, {showHeaders: false}) + '\n'
      }
    } else if (options.ast) {
      const ast = parser.parse(sourcePath, code)
      output = {
        code: JSON.stringify(ast, (key, value) => key === 'loc' ? void 0 : value, 2) + '\n'
      }
    } else {

      const node = compile(sourcePath, code)

      if (sourceMap) {
        node.add(`\n//# sourceMappingURL=${sourceMapPath}\n`)
        output = node.toStringWithSourceMap({
          file: filename
        })
      } else {
        output = {
          code: prettier.format(node.toString(), {})
        }
      }
    }
    success(output)
  } catch (err) {
    error(new PrettyError().render(err))
  }
}
