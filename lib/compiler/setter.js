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
  this.isDataDependent = false;
}

SetterCompiler.prototype.compile = function () {
  var code = 'function (__data__, ' + this.variables.join(', ') + ') {\n';
  if (this.isCacheValue) {
    code += indent('__cache__.' + this.variables[0] + ' = ' + this.variables[0] + ';') + '\n';
  }

  if (this.isDataDependent) {
    code += indent('__data__ = monkberry.extend({' + this.variables.map(function (variable) {
          return variable + ': ' + variable;
        }).join(', ') + '}, __data__)') + '\n';
  }

  if (this.operators.length > 0) {
    code += indent(this.operators.join(';\n')) + ';\n';
  }

  if (size(this.complex) > 0) {
    var complexCode = [];
    var _this = this;
    Object.keys(this.complex).forEach(function (key) {
      var complex = _this.complex[key];

      complexCode.push(
        'if (' + complex.params.map(function (param) {
          return '__cache__.' + param + ' !== undefined';
        }).join(' && ') + ') {\n' +
        indent(complex.compile()) + '\n}'
      );
    });

    code += indent(complexCode.join('\n')) + '\n';
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

  this.complex[complexName].add(functionName, params);
};

SetterCompiler.prototype.cache = function () {
  if (this.variables.length == 1) {
    this.isCacheValue = true;
  } else {
    throw new Error('Value caching available only for setter with one variable.')
  }
};

SetterCompiler.prototype.dataDependent  = function () {
  this.isDataDependent = true;
};

function Complex(params) {
  this.params = params;
  this.calls = [];
}

Complex.prototype.add = function (functionName, params) {
  this.calls[functionName] = params;
};

Complex.prototype.compile = function () {
  var code = [];
  var _this = this;

  Object.keys(this.calls).forEach(function (functionName) {
    var params = _this.calls[functionName];
    code.push('λ.' + functionName + '(__data__, ' + params.map(function (param) {
        return '__cache__.' + param;
      }).join(', ') + ');');
  });

  return code.join('\n');
};

module.exports = SetterCompiler;