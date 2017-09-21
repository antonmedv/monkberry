function SourceLocation(source, start, end) {
  this.source = source
  this.start = start
  this.end = end
}

function Position(line, column) {
  this.line = line
  this.column = column
}

function createSourceLocation(firstToken, lastToken) {
  return new SourceLocation(
    parser.source, // Some sort of magic. In this way we can pass filemane into jison generated parser.
    new Position(firstToken.first_line, firstToken.first_column),
    new Position(lastToken.last_line, lastToken.last_column)
  )
}

function parseRegularExpressionLiteral(literal) {
  var last = literal.lastIndexOf("/")
  var body = literal.substring(1, last)
  var flags = literal.substring(last + 1)

  return new RegExp(body, flags)
}

function parseNumericLiteral(literal) {
  if (literal.charAt(0) === "0") {
    if (literal.charAt(1).toLowerCase() === "x") {
      return parseInt(literal, 16)
    } else {
      return parseInt(literal, 8)
    }
  } else {
    return Number(literal)
  }
}

/* Begin Parser Customization Methods */
var originalParseMethod = parser.parse

parser.parse = function (source, code) {
  parser.source = source
  return originalParseMethod.call(this, code)
}

exports.lex = function (code) {
  const lexer = parser.Parser.prototype.lexer
  const terminals = parser.Parser.prototype.terminals_

  lexer.setInput(code)
  let stack = []
  const lex = () => {
    let token = stack.pop() || lexer.lex()
    if (Array.isArray(token)) {
      stack = token
      token = stack.pop()
    }
    // if token is numeric value, convert
    if (typeof token === 'number') {
      token = terminals[token] || token
    }
    return token
  }

  let token, lexemes = [], i = 0
  do {
    token = lex()
    lexemes.push([token, JSON.stringify(lexer.yytext)])
  } while (token !== 1 && token !== 'EOF')

  return lexemes
}
/* End Parser Customization Methods */
