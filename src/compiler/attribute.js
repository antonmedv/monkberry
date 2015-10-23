import { sourceNode, join } from './sourceNode';
import { collectVariables } from './expression/variable';
import { esc } from '../utils';

export default function (ast) {
  ast.AttributeNode.prototype.compile = function (figure, nodeName) {
    let [expr, defaults] = this.compileToExpression();

    var variables = collectVariables(expr);

    if (variables.length == 0) {
      figure.construct.push(sourceNode(this.loc, [
        nodeName, '.setAttribute(', esc(this.name), ', ', expr.compile(), ');'
      ]));
    } else {
      figure.addUpdater(this.loc, variables, () => sourceNode(this.loc, [
        '      ', nodeName, '.setAttribute(', esc(this.name), ', ', expr.compile(), ')'
      ]));

      if (defaults.length > 0) {
        figure.construct.push(sourceNode(this.loc, [
          nodeName, '.setAttribute(', esc(this.name), ', ', join(defaults, ' + '), ');'
        ]));
      }
    }

  };

  ast.AttributeNode.prototype.compileToExpression = function () {
    var expr, defaults = [];

    var pushDefaults = (node) => {
      if (node.type == 'Literal') {
        defaults.push(node.compile());
      }
    };

    if (this.body.length == 1) {

      expr = extract(this.body[0]);

    } else if (this.body.length >= 2) {

      expr = new ast.BinaryExpressionNode('+', extract(this.body[0]), extract(this.body[1]), this.loc);
      pushDefaults(this.body[0]);
      pushDefaults(this.body[1]);

      var at = expr;
      for (var i = 2; i < this.body.length; i++) {
        at = at.right = new ast.BinaryExpressionNode('+', at.right, extract(this.body[i]), null);
        pushDefaults(this.body[i]);
      }
    }

    return [expr, defaults];
  };
}

function extract(node) {
  if (node.type == 'ExpressionStatement') {
    return node.expression;
  } else {
    return node;
  }
}
