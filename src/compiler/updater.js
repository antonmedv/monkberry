import { sourceNode } from './sourceNode';
import { size, uniqueName } from '../utils';

export class Updater {
  constructor(variables) {
    this.variables = variables.sort();
    this.name = uniqueName(this.variables);
    this.operators = [];
    this.complex = {};
    this.isCacheValue = false;
    this.isDataDependent = false;
  }

  compile() {
    var sn = sourceNode(null, 'function (__data__, ' + this.variables.join(', ') + ') {\n');
    if (this.isCacheValue) {
      sn.add('  __cache__.' + this.variables[0] + ' = ' + this.variables[0] + ';' + '\n');
    }

    if (this.isDataDependent) {
      sn.add([
        '  __data__ = monkberry.extend({',
        this.variables.map((variable) => variable + ': ' + variable).join(', '),
        '  }, __data__)\n']);
    }

    if (this.operators.length > 0) {
      sn.add(sourceNode(null, this.operators).join(';\n'))
        .add(';\n');
    }

    if (size(this.complex) > 0) {
      var complexCode = [];

      Object.keys(this.complex).forEach((key) => {
        var complex = this.complex[key];

        var node = sourceNode(null, '')
          .add('if (')
          .add(complex.params.map((param) => '__cache__.' + param + ' !== undefined').join(' && '))
          .add(') {\n')
          .add(complex.compile())
          .add('\n}');

        complexCode.push(node);
      });

      sn.add(sourceNode(null, complexCode).join('\n'))
        .add('\n');
    }

    sn += '}';

    return sn;
  }

  add(code) {
    this.operators.push(code);
  }

  addComplex(params, functionName) {
    params = params.sort();
    var complexName = uniqueName(params);

    if (!(complexName in this.complex)) {
      this.complex[complexName] = new Complex(params);
    }

    this.complex[complexName].add(functionName, params);
  }

  cache() {
    if (this.variables.length == 1) {
      this.isCacheValue = true;
    } else {
      throw new Error('Value caching available only for setter with one variable.')
    }
  }

  makeDataDependent() {
    this.isDataDependent = true;
  };
}

class Complex {
  constructor(params) {
    this.params = params;
    this.calls = [];
  }

  add(functionName, params) {
    this.calls[functionName] = params;
  }

  compile() {
    var parts = [];

    Object.keys(this.calls).forEach((functionName) => {
      var params = this.calls[functionName];
      parts.push(sourceNode(null, [
        'λ.', functionName, '(__data__, ', params.map((param) => '__cache__.' + param).join(', '), ');'
      ]));
    });

    return sourceNode(null, parts).join('\n');
  }
}
