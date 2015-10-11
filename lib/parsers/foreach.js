var ExpressionParser = require('./expression');

function ForeachParser(input) {
  var parts = input.split('in', 2);

  this.keyName = null;
  this.valueName = null;

  if (parts.length == 2) {
    this.expression = new ExpressionParser(parts[1]);
    var keyvalue = parts[0].split(',', 2);
    if (keyvalue.length == 2) {
      this.keyName = keyvalue[0].trim();
      this.valueName = keyvalue[1].trim();
    } else {
      this.valueName = parts[0].trim();
    }
  } else {
    this.expression = new ExpressionParser(input);
  }
}

module.exports = ForeachParser;
