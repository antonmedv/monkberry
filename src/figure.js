import { sourceNode } from './compiler/sourceNode';

export class Figure {
  constructor(name) {
    this.name = name;
    this.uniqCounters = {};
    this.children = [];
    this.declarations = [];
    this.construct = [];
    this.complexSetters = {};
    this.setters = {};
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

    //if (figure.construct.length > 0) {
    //  sn.add('  // Construct dom\n');
    //  sn.add([indent(figure.construct.join('\n'), 2), '\n']);
    //  sn.add('\n');
    //}
    //
    //sn.add('  // Create view\n');
    //sn.add('  var view = monkberry.view();\n');
    //sn.add('\n');
    //
    //if (size(figure.complexSetters) > 0) {
    //  sn.add('  // Complex setters functions\n');
    //  sn.add('  var __cache__ = view.cache = {};\n');
    //  sn.add('  var λ = {\n');
    //  sn.add([indent(figure.compileComplexSetters(), 4), '\n']);
    //  sn.add('  };\n');
    //  sn.add('\n');
    //}
    //
    //if (size(figure.setters) > 0) {
    //  sn.add('  // Setters functions\n');
    //  sn.add('  view.set = {\n');
    //  sn.add([indent(figure.compileSetters(), 4), '\n']);
    //  sn.add('  };\n');
    //  sn.add('\n');
    //}
    //
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

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0
    }
    return this.uniqCounters[name]++;
  }
}
