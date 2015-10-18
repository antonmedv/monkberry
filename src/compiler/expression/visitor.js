export default function visitor(ast) {
  ast.FilterExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.callee.visit(callback);
    var args = this.arguments;

    for (var i = 0, len = args.length; i < len; i++) {
      args[i].visit(callback);
    }
  };

  ast.ArrayExpressionNode.prototype.visit = function (callback) {
    callback(this);

    var elements = this.elements;

    for (var i = 0, len = elements.length; i < len; i++) {
      elements[i].visit(callback);
    }
  };

  ast.ObjectExpressionNode.prototype.visit = function (callback) {
    callback(this);

    var i, j, properties = this.properties;

    for (i = 0, len = properties.length; i < len; i++) {
      var prop = properties[i];
      var kind = prop.kind;
      var key = prop.key;
      var value = prop.value;

      if (kind === "init") {
        key.visit(callback);
        value.visit(callback);
      } else {
        var params = value.params;
        var body = value.body;

        key.visit(callback);

        for (j = 0, plen = params.length; j < plen; j++) {
          params[j].visit(callback);
        }

        for (j = 0, blen = body.length; j < blen; j++) {
          body[j].visit(callback);
        }
      }
    }
  };

  ast.SequenceExpressionNode.prototype.visit = function (callback) {
    callback(this);

    var expressions = this.expressions;

    for (var i = 0, len = expressions.length; i < len; i++) {
      expressions[i].visit(callback);
    }
  };

  ast.UnaryExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.argument.visit(callback);
  };

  ast.BinaryExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.left.visit(callback);
    this.right.visit(callback);
  };

  ast.AssignmentExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.left.visit(callback);
    this.right.visit(callback);
  };

  ast.UpdateExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.argument.visit(callback);
    this.argument.visit(callback);
  };

  ast.LogicalExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.left.visit(callback);
    this.right.visit(callback);
  };

  ast.ConditionalExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.test.visit(callback);
    this.consequent.visit(callback);
    this.alternate.visit(callback);
  };

  ast.NewExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.callee.visit(callback);
    var args = this.arguments;

    if (args !== null) {
      for (var i = 0, len = args.length; i < len; i++) {
        args[i].visit(callback);
      }
    }
  };

  ast.CallExpressionNode.prototype.visit = function (callback) {
    callback(this);

    this.callee.visit(callback);
    var args = this.arguments;

    for (var i = 0, len = args.length; i < len; i++) {
      args[i].visit(callback);
    }
  };

  ast.MemberExpressionNode.prototype.visit = function (callback) {
    callback(this);
    this.object.visit(callback);
    this.property.visit(callback);
  };

  ast.IdentifierNode.prototype.visit = function (callback) {
    callback(this);
  };

  ast.AccessorNode.prototype.visit = function (callback) {
    callback(this);
  };

  ast.LiteralNode.prototype.visit = function (callback) {
    callback(this);
  };
}
