var ExpressionParser = require('./expression');

var ep = new ExpressionParser('index.indexOf(a) != -1');
console.log(ep.toString());