/* Helper methods */

function SourceLocation(source, start, end) {
  this.source = source;
  this.start = start;
  this.end = end;
}

function Position(line, column) {
  this.line = line;
  this.column = column;
}

function createSourceLocation(firstToken, lastToken, source) {
  return new SourceLocation(
    source || parser.source,
    new Position(firstToken.first_line, firstToken.first_column),
    new Position(lastToken.last_line, lastToken.last_column)
  );
}

function parseRegularExpressionLiteral(literal) {
  var last = literal.lastIndexOf("/");
  var body = literal.substring(1, last);
  var flags = literal.substring(last + 1);

  return new RegExp(body, flags);
}

function parseNumericLiteral(literal) {
  if (literal.charAt(0) === "0") {
    if (literal.charAt(1).toLowerCase() === "x") {
      return parseInt(literal, 16);
    } else {
      return parseInt(literal, 8);
    }
  } else {
    return Number(literal);
  }
}

/* Begin Parser Customization Methods */
var originalParseMethod = parser.parse;

parser.parse = function (code, source) {
  parser.source = source;
  return originalParseMethod.call(this, code);
};
/* End Parser Customization Methods */

function DocumentNode(body, loc) {
  this.type = "Document";
  this.body = body;
  this.loc = loc;
}

function TextNode(text, loc) {
  this.type = "Text";
  this.text = text;
  this.loc = loc;
}

function ElementNode(name, attributes, body, loc) {
  this.type = "Element";
  this.name = name;
  this.attributes = attributes;
  this.body = body;
  this.loc = loc;
}

function AttributeNode(name, body, loc) {
  this.type = "Attribute";
  this.name = name;
  this.body = body;
  this.loc = loc;
}

function ExpressionStatementNode(expression, loc) {
  this.type = 'ExpressionStatement';
  this.expression = expression;
  this.loc = loc;
}

function IfStatementNode(test, then, _else, loc) {
  this.type = "IfStatement";
  this.test = test;
  this.then = then;
  this._else = _else;
  this.loc = loc;
}

function ForStatementNode(expr, body, options, loc) {
  this.type = "ForStatement";
  this.expr = expr;
  this.body = body;
  this.options = options;
  this.loc = loc;
}

function FilterExpressionNode(callee, args, loc) {
  this.type = "FilterExpression";
  this.callee = callee;
  this.arguments = args;
  this.loc = loc;
}

function ThisExpressionNode(loc) {
  this.type = "ThisExpression";
  this.loc = loc;
}

function ArrayExpressionNode(elements, loc) {
  this.type = "ArrayExpression";
  this.elements = elements;
  this.loc = loc;
}

function ObjectExpressionNode(properties, loc) {
  this.type = "ObjectExpression";
  this.properties = properties;
  this.loc = loc;
}

function SequenceExpressionNode(expressions, loc) {
  this.type = "SequenceExpression";
  this.expressions = expressions;
  this.loc = loc;
}

function UnaryExpressionNode(operator, prefix, argument, loc) {
  this.type = "UnaryExpression";
  this.operator = operator;
  this.prefix = prefix;
  this.argument = argument;
  this.loc = loc;
}

function BinaryExpressionNode(operator, left, right, loc) {
  this.type = "BinaryExpression";
  this.operator = operator;
  this.left = left;
  this.right = right;
  this.loc = loc;
}

function AssignmentExpressionNode(operator, left, right, loc) {
  this.type = "AssignmentExpression";
  this.operator = operator;
  this.left = left;
  this.right = right;
  this.loc = loc;
}

function UpdateExpressionNode(operator, argument, prefix, loc) {
  this.type = "UpdateExpression";
  this.operator = operator;
  this.argument = argument;
  this.prefix = prefix;
  this.loc = loc;
}

function LogicalExpressionNode(operator, left, right, loc) {
  this.type = "LogicalExpression";
  this.operator = operator;
  this.left = left;
  this.right = right;
  this.loc = loc;
}

function ConditionalExpressionNode(test, consequent, alternate, loc) {
  this.type = "ConditionalExpression";
  this.test = test;
  this.consequent = consequent;
  this.alternate = alternate;
  this.loc = loc;
}

function NewExpressionNode(callee, args, loc) {
  this.type = "NewExpression";
  this.callee = callee;
  this.arguments = args;
  this.loc = loc;
}

function CallExpressionNode(callee, args, loc) {
  this.type = "CallExpression";
  this.callee = callee;
  this.arguments = args;
  this.loc = loc;
}

function MemberExpressionNode(object, property, computed, loc) {
  this.type = "MemberExpression";
  this.object = object;
  this.property = property;
  this.computed = computed;
  this.loc = loc;
}

function IdentifierNode(name, loc) {
  this.type = "Identifier";
  this.name = name;
  this.loc = loc;
}

function AccessorNode(name, loc) {
  this.type = "Accessor";
  this.name = name;
  this.loc = loc;
}

function LiteralNode(value, loc) {
  this.type = "Literal";
  this.value = value;
  this.loc = loc;
}

parser.ast = {};
parser.ast.DocumentNode = DocumentNode;
parser.ast.TextNode = TextNode;
parser.ast.ElementNode = ElementNode;
parser.ast.AttributeNode = AttributeNode;
parser.ast.ExpressionStatementNode = ExpressionStatementNode;
parser.ast.IfStatementNode = IfStatementNode;
parser.ast.ForStatementNode = ForStatementNode;
parser.ast.FilterExpressionNode = FilterExpressionNode;
parser.ast.ThisExpressionNode = ThisExpressionNode;
parser.ast.ArrayExpressionNode = ArrayExpressionNode;
parser.ast.ObjectExpressionNode = ObjectExpressionNode;
parser.ast.SequenceExpressionNode = SequenceExpressionNode;
parser.ast.UnaryExpressionNode = UnaryExpressionNode;
parser.ast.BinaryExpressionNode = BinaryExpressionNode;
parser.ast.AssignmentExpressionNode = AssignmentExpressionNode;
parser.ast.UpdateExpressionNode = UpdateExpressionNode;
parser.ast.LogicalExpressionNode = LogicalExpressionNode;
parser.ast.ConditionalExpressionNode = ConditionalExpressionNode;
parser.ast.NewExpressionNode = NewExpressionNode;
parser.ast.CallExpressionNode = CallExpressionNode;
parser.ast.MemberExpressionNode = MemberExpressionNode;
parser.ast.IdentifierNode = IdentifierNode;
parser.ast.AccessorNode = AccessorNode;
parser.ast.LiteralNode = LiteralNode;
