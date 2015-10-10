var generator = require('./expression/generator');
var parser = require('./expression/grammar').parser;

parser = generator(parser);

function ExpressionParser(expression) {
  this.ast = parser.parse(expression);
}

ExpressionParser.prototype.toString = function () {
  return this.ast.print();
};

module.exports = ExpressionParser;
