var ExpressionParser = require('./expression');

var ep = new ExpressionParser('index.indexOf(a) != -1 | filter(b.this.is.awesomw["wow"].really)');
console.log(ep.toString());