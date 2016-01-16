import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';

export default function (ast) {
  ast.ExpressionStatementNode.prototype.compile = function (figure) {
    this.nodeName = 'text' + figure.uniqid();

    figure.declarations.push(
      sourceNode(null, ["var ", this.nodeName, " = document.createTextNode('');"])
    );

    var variables = collectVariables(this.expression);

    if (variables.length == 0) {
      figure.construct.push(sourceNode(this.loc, [this.nodeName, '.textContent = ', this.expression.compile(), ';']));
    } else {
      figure.addUpdater(this.loc, variables, () => sourceNode(this.loc, ['      ', this.nodeName, '.textContent = ', this.expression.compile()]));
    }

    return this.nodeName;
  };

  ast.FilterExpressionNode.prototype.compile = function () {
    var sn = sourceNode(this.loc, ['__filters.', this.callee.compile(), '(']);

    for (let i = 0; i < this.arguments.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(this.arguments[i].compile());
    }

    return sn.add(')');
  };

  ast.ArrayExpressionNode.prototype.compile = function () {
    var sn = sourceNode(this.loc, '[');
    var elements = this.elements;

    for (var i = 0; i < this.elements.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(elements[i].compile());
    }

    return sn.add(']');
  };

  ast.ObjectExpressionNode.prototype.compile = function () {
    var sn = sourceNode(this.loc, '({');

    for (let i = 0; i < this.properties.length; i++) {
      var prop = this.properties[i];
      var kind = prop.kind;
      var key = prop.key;
      var value = prop.value;

      if (i !== 0) {
        sn.add(', ');
      }

      if (kind === 'init') {
        sn.add([key.compile(), ': ', value.compile()]);
      } else {
        var params = value.params;
        var body = value.body;

        sn.add([kind, ' ', key.compile(), '(']);

        for (let j = 0; j < params.length; j++) {
          if (j !== 0) {
            sn.add(', ');
          }

          sn.add(params[j].compile());
        }

        sn.add(') { ');

        for (let j = 0; j < body.length; j++) {
          sn.add([body[j].compile(), ' ']);
        }

        sn.add('}');
      }
    }

    return sn.add('})');
  };

  ast.SequenceExpressionNode.prototype.compile = function () {
    var sn = sourceNode(this.loc, '');

    for (var i = 0; i < this.expressions.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(this.expressions[i].compile());
    }

    return sn;
  };

  ast.UnaryExpressionNode.prototype.compile = function () {
    if (this.operator == 'delete' || this.operator == 'void' || this.operator == 'typeof') {
      return sourceNode(this.loc, [this.operator, ' (', this.argument.compile(), ')']);
    } else {
      return sourceNode(this.loc, [this.operator, '(', this.argument.compile(), ')']);
    }
  };

  ast.BinaryExpressionNode.prototype.compile = function () {
    return sourceNode(this.loc, ['(', this.left.compile(), ') ', this.operator, ' (', this.right.compile(), ')']);
  };

  ast.AssignmentExpressionNode.prototype.compile = function () {
    return sourceNode(this.loc, ['(', this.left.compile(), ') ', this.operator, ' (', this.right.compile(), ')']);
  };

  ast.UpdateExpressionNode.prototype.compile = function () {
    if (this.prefix) {
      return sourceNode(this.loc, ['(', this.operator, this.argument.compile(), ')']);
    } else {
      return sourceNode(this.loc, ['(', this.argument.compile(), this.operator, ')']);
    }
  };

  ast.LogicalExpressionNode.prototype.compile = function () {
    return sourceNode(this.loc, ['(', this.left.compile(), ') ', this.operator, ' (' + this.right.compile(), ')']);
  };

  ast.ConditionalExpressionNode.prototype.compile = function () {
    return sourceNode(this.loc, ['(', this.test.compile(), ') ? ', this.consequent.compile(), ' : ', this.alternate.compile()]);
  };

  ast.NewExpressionNode.prototype.compile = function () {
    var sn = sourceNode(this.loc, ['new ', this.callee.compile()]);

    if (this.arguments !== null) {
      sn.add('(');

      for (var i = 0; i < this.arguments.length; i++) {
        if (i !== 0) {
          sn.add(', ');
        }

        sn.add(this.arguments[i].compile());
      }

      sn.add(')');
    }

    return sn;
  };

  ast.CallExpressionNode.prototype.compile = function () {
    var sn = sourceNode(this.loc, [this.callee.compile(), '(']);

    for (let i = 0; i < this.arguments.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(this.arguments[i].compile());
    }

    return sn.add(')');
  };

  ast.MemberExpressionNode.prototype.compile = function () {
    if (this.computed) {
      return sourceNode(this.loc, [this.object.compile(), '[', this.property.compile(), ']']);
    } else {
      return sourceNode(this.loc, [this.object.compile(), '.', this.property.compile()]);
    }
  };

  ast.IdentifierNode.prototype.compile = function () {
    return sourceNode(this.loc, this.name);
  };

  ast.AccessorNode.prototype.compile = function () {
    return sourceNode(this.loc, this.name);
  };

  ast.LiteralNode.prototype.compile = function () {
    return sourceNode(this.loc, this.value.toString());
  };
}
