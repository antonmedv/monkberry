var generator = require('./expression/generator');
var visitor = require('./expression/ast_visitor');
var parser = require('./expression/grammar').parser;

parser = generator(visitor(parser));

function ExpressionParser(expression) {
  this.ast = parser.parse(expression);

  var variables = [];

  this.ast.visit(function (node) {
    if (node.type == 'Identifier') {
      if (variables.indexOf(node.name) == -1) {
        variables.push(node.name);
      }
    }
  });

  this.variables = variables;
}

ExpressionParser.prototype.toCode = function () {
  return this.ast.print();
};

module.exports = ExpressionParser;
