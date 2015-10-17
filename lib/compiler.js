'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _parser = require('../parser');

var _figure = require('./figure');

var _compilerDocument = require('./compiler/document');

var _compilerDocument2 = _interopRequireDefault(_compilerDocument);

var _compilerElement = require('./compiler/element');

var _compilerElement2 = _interopRequireDefault(_compilerElement);

var _compilerExpression = require('./compiler/expression');

var _compilerExpression2 = _interopRequireDefault(_compilerExpression);

(0, _compilerDocument2['default'])(_parser.parser.ast);
(0, _compilerElement2['default'])(_parser.parser.ast);
(0, _compilerExpression2['default'])(_parser.parser.ast);

var fs = require('fs');
var file = 'template.twig';
var code = fs.readFileSync(__dirname + '/../html/' + file, { encoding: 'utf8' });

var figure = new _figure.Figure('template');
var ast = _parser.parser.parse(code, file);

var output = ast.compile(figure).toStringWithSourceMap({
  file: 'dist.js'
});

console.log(output.code);
console.log(output.map.toString());