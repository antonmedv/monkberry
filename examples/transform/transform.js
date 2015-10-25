var prefix = 'monk-';

module.exports = function (ast, parser) {
  var binary = parser.ast.BinaryExpressionNode,
    literal = parser.ast.LiteralNode;

  ast.visit(function (node) {
    if (node.type == 'Attribute') {
      if (node.name == 'class') {

        for (var i = 0; i < node.body.length; i++) {
          if (node.body[i].type == 'Literal') {
            node.body[i] = new binary('+', new literal('"' + prefix + '"'), node.body[i]);
          } else if (node.body[i].type == 'ExpressionStatement') {
            node.body[i].expression = new binary('+', new literal('"' + prefix + '"'), node.body[i].expression);
          }
        }

      }
    }
  });
};
