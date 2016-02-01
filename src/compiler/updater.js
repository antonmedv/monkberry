import { sourceNode } from './sourceNode';
import { size, uniqueName } from '../utils';

export class Updater {
  constructor(variables) {
    this.variables = variables.sort();
    this.name = uniqueName(this.variables);
    this.operators = [];
    this.complex = {};
    this.isCacheValue = false;
    this.declareVariableName = null;
  }

  compile() {
    var sn = sourceNode(null, 'function (__data__, ' + this.variables.join(', ') + ') {\n');

    if (this.isCacheValue) {
      sn.add('      __cache__.' + this.variables[0] + ' = ' + this.variables[0] + ';' + '\n');
    }

    if (this.declareVariableName) {
      sn.add('      var ' + this.declareVariableName + ';\n');
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
          .add('      if (')
          .add(complex.params.map((param) => '__cache__.' + param + ' !== undefined').join(' && '))
          .add(') {\n')
          .add(complex.compile())
          .add('\n      }');

        complexCode.push(node);
      });

      sn.add(sourceNode(null, complexCode).join('\n'))
        .add('\n');
    }

    sn.add('    }');

    return sn;
  }

  add(code) {
    this.operators.push(code);
    return this;
  }

  addComplex(loc, params, functionName) {
    params = params.sort();
    var complexName = uniqueName(params);

    if (!(complexName in this.complex)) {
      this.complex[complexName] = new Complex(params);
    }

    this.complex[complexName].add(functionName, [loc, params]);
    return this;
  }

  cache() {
    if (this.variables.length == 1) {
      this.isCacheValue = true;
    } else {
      throw new Error('Value caching available only for setter with one variable.')
    }
    return this;
  }

  declareVariable(name) {
    this.declareVariableName = name;
    return this;
  }
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
      var [loc, params] = this.calls[functionName];
      parts.push(sourceNode(loc, [
        '        λ__', functionName, '(__data__, ', params.map((param) => '__cache__.' + param).join(', '), ');'
      ]));
    });

    return sourceNode(null, parts).join('\n');
  }
}
