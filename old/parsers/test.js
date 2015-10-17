var ExpressionParser = require('./expression');

var ep = new ExpressionParser('value + a / 2 | filter(a.s)');
var ep2 = new ExpressionParser('f+g+h');
console.log(ep2.variables);
console.log(ep.variables);
console.log(ep.toString());
