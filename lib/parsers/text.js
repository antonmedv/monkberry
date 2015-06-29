var VariableParser = require('./variable');

function TextParser(text, delimiters) {
  if (!delimiters) {
    delimiters = '{{ }}';
  }

  delimiters = delimiters.split(' ');

  this.variables = [];
  this.textParts = [];

  var left = delimiters.shift();
  var right = delimiters.pop();

  var i = 0;
  var nextDelimiter = left;
  var nextType = 'text';
  while (text.length > 0) {
    i = text.indexOf(nextDelimiter);
    if (i == -1) {
      this.textParts.push(text);
      break;
    }

    var value = text.substring(0, i);

    if (nextType === 'var') {
      this.variables.push(new VariableParser(value));
    } else {
      this.textParts.push(value);
    }

    text = text.substring(i + nextDelimiter.length);

    nextDelimiter = nextDelimiter === left ? right : left;
    nextType = nextType === 'text' ? 'var' : 'text';
  }

}

TextParser.prototype.rawText = function () {
  return this.textParts.join('');
};

TextParser.prototype.getUniqueByVariableNames = function () {
  var u = {}, uniqVars = [];
  for (var v of this.variables) {
    if (u.hasOwnProperty(v.name)) {
      continue;
    }
    uniqVars.push(v);
    u[v.name] = true;
  }
  return uniqVars;
};

module.exports = TextParser;
