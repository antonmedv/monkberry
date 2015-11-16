import { sourceNode, join } from './compiler/sourceNode';
import { Updater } from './compiler/updater';
import { size, uniqueName, map } from './utils';

export function createFigure(name, nodes) {
  var figure = new Figure(name);
  figure.children = map(nodes, (node) => node.compile(figure));
  return figure;
}

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
    this.renderActions = [];
    this.subFigures = [];
    this.perceivedAsLibrary = false;
  }

  compile() {
    var sn = sourceNode(null, 'function () {\n');

    if (this.declarations.length > 0) {
      sn.add('  // Create elements\n')
        .add(['  ', this.compileDeclarations(), '\n'])
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
        .add('  var __cache__ = view.__cache__ = {};\n')
        .add('  var λ = {\n')
        .add([this.compileComplexUpdaters(), '\n'])
        .add('  };\n')
        .add('\n');
    }

    if (size(this.updaters) > 0) {
      sn.add('  // Update functions\n')
        .add('  view.__update__ = {\n')
        .add([this.compileUpdaters(), '\n'])
        .add('  };\n')
        .add('\n');
    }

    if (this.renderActions.length > 0) {
      sn.add('  // Extra render actions\n')
        .add('  view.onRender = function () {\n')
        .add([this.compileRenderActions(), '\n'])
        .add('  };\n')
        .add('\n');
    }

    sn.add('  // Set root nodes\n');
    sn.add(['  view.nodes = [', join(this.children, ', '), '];\n']);
    sn.add('  return view;\n');

    sn.add('}');

    return sn;
  }

  declare(nodes) {
    this.declarations.push(sourceNode(null, nodes));
  }

  compileDeclarations() {
    return sourceNode(null, this.declarations).join('\n  ');
  }

  compileDomConstruction() {
    return sourceNode(null, this.construct).join('\n  ');
  }

  compileComplexUpdaters() {
    var parts = [];

    Object.keys(this.complexUpdaters).forEach((key) => {
      parts.push(join(['    ', key, ': ', this.complexUpdaters[key].compile()]));
    });

    return sourceNode(null, parts).join(',\n');
  }

  compileUpdaters() {
    var parts = [];

    Object.keys(this.updaters).forEach((key) => {
      parts.push(join(['    ', key, ': ', this.updaters[key].compile()]));
    });

    return sourceNode(null, parts).join(',\n');
  }

  compileRenderActions() {
    var parts = [];
    for (var control of this.renderActions) {
      parts.push(control);
    }
    return join(parts, '\n');
  }

  addUpdater(loc, variables, callback) {
    if (variables.length == 1) {

      return this.onUpdater(variables[0]).add(callback());

    } else if (variables.length > 1) {

      var complexUpdater = this.onComplexUpdater(variables);
      complexUpdater.add(callback());

      for (let variable of variables) {
        this.onUpdater(variable).cache();
        this.onUpdater(variable).addComplex(loc, variables, complexUpdater.name);
      }

      return complexUpdater;
    }
  }

  onUpdater(variableName) {
    return variableName in this.updaters ? this.updaters[variableName] : this.updaters[variableName] = new Updater([variableName]);
  }

  onComplexUpdater(variables) {
    var name = uniqueName(variables);
    return name in this.complexUpdaters ? this.complexUpdaters[name] : this.complexUpdaters[name] = new Updater(variables);
  }

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0
    }
    return this.uniqCounters[name]++;
  }
}
