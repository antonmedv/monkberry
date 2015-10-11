var ExpressionParser = require('./expression');

function Splitter(text, delimiters) {
  if (!delimiters) {
    delimiters = '{{ }}';
  }

  delimiters = delimiters.split(' ');

  this.expressions = [];
  this.strings = [];
  this.variables = [];

  var left = delimiters.shift();
  var right = delimiters.pop();

  var i = 0;
  var nextDelimiter = left;
  var nextType = 'text';
  while (text.length > 0) {
    i = text.indexOf(nextDelimiter);
    if (i == -1) {
      this.strings.push(text);
      break;
    }

    var value = text.substring(0, i);

    if (nextType === 'var') {
      var exprParser = new ExpressionParser(value);
      this.expressions.push(exprParser);
      this.addVariables(exprParser.variables);
    } else {
      this.strings.push(value);
    }

    text = text.substring(i + nextDelimiter.length);

    nextDelimiter = nextDelimiter === left ? right : left;
    nextType = nextType === 'text' ? 'var' : 'text';
  }

}

Splitter.prototype.rawText = function () {
  return this.strings.join('');
};

Splitter.prototype.addVariables = function (variables) {
  for (var variable of variables) {
    if (this.variables.indexOf(variable) == -1) {
      this.variables.push(variable);
    }
  }
};

Splitter.prototype.toCode = function () {
  var code = [];

  var i = 0;
  for (var part of this.strings) {
    if (part !== '') {
      code.push(esc(part));
    }
    if (i < this.expressions.length) {
      code.push(this.expressions[i++].toCode());
    }
  }
  return code.join(' + ');
};

function esc(str) {
  return JSON.stringify(str);
}

module.exports = Splitter;
