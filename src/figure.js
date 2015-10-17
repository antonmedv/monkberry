import { sourceNode } from './compiler/sourceNode';

export class Figure {
  constructor(name) {
    this.name = name;
    this.uniqCounters = {};
    this.declarations = [];
    this.construct = [];
    this.complexSetters = {};
    this.setters = {};
    this.variables = {};
    this.updateActions = [];
    this.subFigures = [];
    this.perceivedAsLibrary = false;
  }

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0
    }
    return this.uniqCounters[name]++;
  }

  compileDeclarations() {
    return sourceNode(null, this.declarations).join(',\n    ');
  }
}
