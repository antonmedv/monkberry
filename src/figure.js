import { sourceNode } from './compiler/sourceNode';
import { size } from './utils';

export class Figure {
  constructor(name) {
    this.name = name;
    this.uniqCounters = {};
    this.children = [];
    this.declarations = [];
    this.construct = [];
    this.complexUpdaters = {};
    this.updaters = {};
    this.variables = {};
    this.updateActions = [];
    this.subFigures = [];
    this.perceivedAsLibrary = false;
  }

  compile() {
    var sn = sourceNode(null, 'function () {\n');

    if (this.declarations.length > 0) {
      sn.add('  // Create elements\n')
        .add(['  var ', this.compileDeclarations(), ';\n'])
        .add('\n');
    }

    if (this.construct.length > 0) {
      sn.add('  // Construct dom\n')
        .add(['  ', this.compileDomConstruction(), '\n'])
        .add('\n');
    }

    sn.add('  // Create view\n')
      .add('  var view = monkberry.view();\n')
      .add('\n');

    if (size(this.complexUpdaters) > 0) {
      sn.add('  // Complex update functions\n')
        .add('  var __cache__ = view.cache = {};\n')
        .add('  var λ = {\n')
        .add([this.compileComplexUpdaters(), '\n'])
        .add('  };\n')
        .add('\n');
    }

    if (size(this.updaters) > 0) {
      sn.add('  // Update functions\n')
        .add('  view.set = {\n')
        .add([this.compileUpdaters(), '\n'])
        .add('  };\n')
        .add('\n');
    }

    //if (figure.updateActions.length > 0) {
    //  sn.add('  // Extra update function\n');
    //  sn.add('  view._update = function (__data__) {\n');
    //  sn.add([indent(figure.compileUpdateActions(), 4), '\n']);
    //  sn.add('  };\n');
    //  sn.add('\n');
    //}

    sn.add('  // Set root nodes\n');
    sn.add(['  view.nodes = [', this.children.join(', '), '];\n']);
    sn.add('  return view;\n');

    sn.add('}');

    return sn;
  }

  compileDeclarations() {
    return sourceNode(null, this.declarations).join(',\n    ');
  }

  compileDomConstruction() {
    return sourceNode(null, this.construct).join('\n  ');
  }

  compileComplexUpdaters() {
    var parts = [];

    Object.keys(this.complexUpdaters).forEach((key) => {
      parts.push(key + ': ' + this.complexUpdaters[key].compile());
    });

    return sourceNode(null, parts).join(',\n');
  }

  compileUpdaters() {
    var parts = [];

    Object.keys(this.updaters).forEach((key) => {
      parts.push(key + ': ' + this.updaters[key].compile());
    });

    return sourceNode(null, parts).join(',\n');
  }

  compileExpression(expression, callback, dataDependent) {
    dataDependent = dataDependent || false;

    if (expression.variables.length == 1) {
      this.onSetter(expression.variables[0]).add(callback(expression.toCode()));
    } else if (expression.variables.length > 1) {
      var complexSetter = this.onComplexSetter(expression.variables);
      complexSetter.add(callback(expression.toCode()));

      if (dataDependent) {
        complexSetter.dataDependent();
      }

      for (variable of expression.variables) {
        this.onSetter(variable).cache();
        this.onSetter(variable).addComplex(expression.variables, complexSetter.name);
      }
    }

    return expression;
  }

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0
    }
    return this.uniqCounters[name]++;
  }
}
