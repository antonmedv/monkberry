'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _parser = require('../parser');

var _figure = require('./figure');

var _compilerSourceNode = require('./compiler/sourceNode');

var _compilerExpression = require('./compiler/expression');

var _compilerExpression2 = _interopRequireDefault(_compilerExpression);

var _compilerExpressionVisitor = require('./compiler/expression/visitor');

var _compilerExpressionVisitor2 = _interopRequireDefault(_compilerExpressionVisitor);

var _compilerDocument = require('./compiler/document');

var _compilerDocument2 = _interopRequireDefault(_compilerDocument);

var _compilerElement = require('./compiler/element');

var _compilerElement2 = _interopRequireDefault(_compilerElement);

var _compilerAttribute = require('./compiler/attribute');

var _compilerAttribute2 = _interopRequireDefault(_compilerAttribute);

var _compilerText = require('./compiler/text');

var _compilerText2 = _interopRequireDefault(_compilerText);

var _compilerIf = require('./compiler/if');

var _compilerIf2 = _interopRequireDefault(_compilerIf);

var _compilerFor = require('./compiler/for');

var _compilerFor2 = _interopRequireDefault(_compilerFor);

var Compiler = (function () {
  function Compiler() {
    _classCallCheck(this, Compiler);

    this.sources = [];

    // Extend AST with compilers.
    (0, _compilerDocument2['default'])(_parser.parser.ast);
    (0, _compilerElement2['default'])(_parser.parser.ast);
    (0, _compilerAttribute2['default'])(_parser.parser.ast);
    (0, _compilerExpression2['default'])(_parser.parser.ast);
    (0, _compilerExpressionVisitor2['default'])(_parser.parser.ast);
    (0, _compilerText2['default'])(_parser.parser.ast);
    (0, _compilerIf2['default'])(_parser.parser.ast);
    (0, _compilerFor2['default'])(_parser.parser.ast);
  }

  _createClass(Compiler, [{
    key: 'addSource',
    value: function addSource(name, code) {
      this.sources.push([name, code]);
    }
  }, {
    key: 'compile',
    value: function compile() {
      var asModule = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var figures = (0, _compilerSourceNode.sourceNode)(null, '');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          var _name = _step$value[0];
          var code = _step$value[1];

          var ast = _parser.parser.parse(code, _name);
          var figure = new _figure.Figure(_name.replace(/\.\w+$/, ''));

          figures.add(ast.compile(figure));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var output = (0, _compilerSourceNode.sourceNode)(null, '');
      if (asModule) {
        output.add('module.exports = function (monkberry, document) {\n').add('var filters = monkberry.filters;\n').add('return {\n').add(figures).add('};\n').add('};\n');
      } else {
        output.add('(function (monkberry, filters, document, undefined) {\n').add('monkberry.mount({\n').add(figures).add('\n});\n').add('})(monkberry, monkberry.filters, window.document, void 0);\n');
      }

      return output;
    }
  }]);

  return Compiler;
})();

exports['default'] = Compiler;
module.exports = exports['default'];