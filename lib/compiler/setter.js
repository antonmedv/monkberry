var uniqueName = require('../utils/uniq_name');
var size = require('../utils/size');
var indent = require('../utils/indent').indent;
var indentFromSecondLine = require('../utils/indent').indentFromSecondLine;

function SetterCompiler(variables) {
  this.variables = variables.sort();
  this.name = uniqueName(this.variables);
  this.operators = [];
  this.complex = {};
  this.isCacheValue = false;
}

SetterCompiler.prototype.compile = function () {
  var code = 'function (__data__, ' + this.variables.join(', ') + ') {\n';
  if (this.isCacheValue) {
    code += indent('$.' + this.variables[0] + ' = ' + this.variables[0] + ';') + '\n';
  }

  if (this.operators.length > 0) {
    code += indent(this.operators.join(';\n')) + ';\n';
  }

  if (size(this.complex) > 0) {
    var complexCode = '\n';
    var _this = this;
    Object.keys(this.complex).forEach(function (key) {
      var complex = _this.complex[key];

      complexCode += 'if (' + complex.params.map(function (param) {
          return '$.' + param + ' !== undefined';
        }).join(' && ') + ') {\n';

      complexCode += indent(complex.operators.join('\n'));

      complexCode += '\n}';
    });

    code += indent(complexCode) + '\n';
  }

  code += '}';

  return code;
};

SetterCompiler.prototype.add = function (code) {
  this.operators.push(code);
};

SetterCompiler.prototype.addComplex = function (params, functionName) {
  params = params.sort();
  var complexName = uniqueName(params);
  if (!(complexName in this.complex)) {
    this.complex[complexName] = new Complex(params);
  }

  this.complex[complexName].add(functionName + '(' + params.map(function (param) {
      return '$.' + param;
    }).join(', ') + ');');
};

SetterCompiler.prototype.cache = function () {
  if (this.variables.length == 1) {
    this.isCacheValue = true;
  } else {
    throw new Error('Value caching available only for setter with one variable.')
  }
};

function Complex(params) {
  this.params = params;
  this.operators = [];
}

Complex.prototype.add = function (operator) {
  this.operators.push(operator);
};

module.exports = SetterCompiler;