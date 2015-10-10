module.exports = function (parser) {
  var ast = parser.ast;

  ast.ProgramNode.prototype.print = function (indent, indentChar) {
    indent = indent || '';
    indentChar = indentChar || ' ';

    var elements = this.body;
    var str = [];

    for (var i = 0, len = elements.length; i < len; i++) {
      str.push(elements[i].print(indent, indentChar));
    }

    return str.join(', ');
  };

  ast.ExpressionStatementNode.prototype.print = function (indent, indentChar) {
    return indent + this.expression.print(indent, indentChar);
  };

  ast.FilterExpressionNode.prototype.print = function (indent, indentChar) {
    var str = "filters." + this.callee.print("", "") + "(";
    var args = this.arguments;

    for (var i = 0, len = args.length; i < len; i++) {
      if (i !== 0)
        str += ", ";

      str += args[i].print("", "");
    }

    return str + ")";
  };

  ast.ArrayExpressionNode.prototype.print = function (indent, indentChar) {
    var str = "[";
    var elements = this.elements;

    for (var i = 0, len = elements.length; i < len; i++) {
      if (i !== 0)
        str += ", ";

      str += elements[i].print("", "");
    }

    return str + "]";
  };

  ast.ObjectExpressionNode.prototype.print = function (indent, indentChar) {
    var str = "({";
    var properties = this.properties;

    for (var i = 0, len = properties.length; i < len; i++) {
      var prop = properties[i];
      var kind = prop.kind;
      var key = prop.key;
      var value = prop.value;

      if (i !== 0)
        str += ", ";

      if (kind === "init") {
        str += key.print("", "") + ": " + value.print("", "");
      } else {
        var params = value.params;
        var body = value.body;

        str += kind + " " + key.print("", "") + "(";

        for (var j = 0, plen = params.length; j < plen; j++) {
          if (j !== 0)
            str += ", ";

          str += params[j].print("", "");
        }

        str += ") { ";

        for (var j = 0, blen = body.length; j < blen; j++) {
          str += body[j].print("", "") + " ";
        }

        str += "}";
      }
    }

    return str + "})";
  };

  ast.SequenceExpressionNode.prototype.print = function (indent, indentChar) {
    var str = "";
    var expressions = this.expressions;

    for (var i = 0, len = expressions.length; i < len; i++) {
      if (i !== 0)
        str += ", ";

      str += expressions[i].print("", "");
    }

    return str;
  };

  ast.UnaryExpressionNode.prototype.print = function (indent, indentChar) {
    var operator = this.operator;

    if (operator === "delete" || operator === "void" || operator === "typeof") {
      return operator + " (" + this.argument.print("", "") + ")";
    } else {
      return operator + "(" + this.argument.print("", "") + ")";
    }
  };

  ast.BinaryExpressionNode.prototype.print = function (indent, indentChar) {
    return "(" + this.left.print("", "") + ") " + this.operator + " (" + this.right.print("", "") + ")";
  };

  ast.AssignmentExpressionNode.prototype.print = function (indent, indentChar) {
    return "(" + this.left.print("", "") + ") " + this.operator + " (" + this.right.print("", "") + ")";
  };

  ast.UpdateExpressionNode.prototype.print = function (indent, indentChar) {
    if (this.prefix) {
      return "(" + this.operator + this.argument.print("", "") + ")";
    } else {
      return "(" + this.argument.print("", "") + this.operator + ")";
    }
  };

  ast.LogicalExpressionNode.prototype.print = function (indent, indentChar) {
    return "(" + this.left.print("", "") + ") " + this.operator + " (" + this.right.print("", "") + ")";
  };

  ast.ConditionalExpressionNode.prototype.print = function (indent, indentChar) {
    return "(" + this.test.print("", "") + ") ? " + this.consequent.print("", "") + " : " + this.alternate.print("", "");
  };

  ast.NewExpressionNode.prototype.print = function (indent, indentChar) {
    var str = "new " + this.callee.print("", "");
    var args = this.arguments;

    if (args !== null) {
      str += "(";

      for (var i = 0, len = args.length; i < len; i++) {
        if (i !== 0)
          str += ", ";

        str += args[i].print("", "");
      }

      str += ")";
    }

    return str;
  };

  ast.CallExpressionNode.prototype.print = function (indent, indentChar) {
    var str = this.callee.print("", "") + "(";
    var args = this.arguments;

    for (var i = 0, len = args.length; i < len; i++) {
      if (i !== 0)
        str += ", ";

      str += args[i].print("", "");
    }

    return str + ")";
  };

  ast.MemberExpressionNode.prototype.print = function (indent, indentChar) {
    if (this.computed) {
      return this.object.print("", "") + "[" + this.property.print("", "") + "]";
    } else {
      return this.object.print("", "") + "." + this.property.print("", "");
    }
  };

  ast.IdentifierNode.prototype.print = function (indent, indentChar) {
    return "data." + this.name;
  };

  ast.AccessorNode.prototype.print = function (indent, indentChar) {
    return this.name;
  };

  ast.LiteralNode.prototype.print = function (indent, indentChar) {
    return this.value;
  };

  return parser;
};
