var generator = require('./generator');
var parser = require('./expression').parser;

parser = generator(parser);

var ast = parser.parse('value + foo.boo | filter');

console.log(ast.print());
