import { parser } from '../parser';
import { Figure } from './figure';
import document from './compiler/document';
import element from './compiler/element';
import expression from './compiler/expression';

document(parser.ast);
element(parser.ast);
expression(parser.ast);


var fs = require('fs');
var file = 'template.twig';
var code = fs.readFileSync(__dirname + '/../html/' + file, {encoding: 'utf8'});

var figure = new Figure('template');
var ast = parser.parse(code, file);

var output  = ast.compile(figure).toStringWithSourceMap({
  file: 'dist.js'
});

console.log(output.code);
console.log(output.map.toString());

