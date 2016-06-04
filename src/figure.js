import { sourceNode } from './compiler/sourceNode';
import { size } from './utils';
import { Spot } from './spot';

export class Figure {
  constructor(name, parent = null) {
    this.name = name;
    this.parent = parent;
    this.uniqCounters = {};
    this.children = [];
    this.functions = {};
    this.declarations = [];
    this.constructions = [];
    this.renderActions = [];
    this.subFigures = [];
    this.spots = {};
  }

  generate() {
    var sn = sourceNode(`function () {\n`);

    if (this.declarations.length > 0) {
      sn.add([
        `  // Create elements\n`,
        `  `, sourceNode(this.declarations).join(`\n  `),
        `\n\n`
      ]);
    }

    if (this.constructions.length > 0) {
      sn.add([
        `  // Construct dom\n`,
        `  `, sourceNode(null, this.constructions).join(`\n  `),
        `\n\n`
      ]);
    }

    if (size(this.spots) > 0) {
      sn.add([
        `  // Update functions\n`,
        `  this.__update__ = {\n`,
        this.generateSpots(), `\n`,
        `  };\n`,
        `\n`
      ]);
    }

    if (this.renderActions.length > 0) {
      sn.add([
        `  // Extra render actions\n`,
        `  view.onRender = function () {\n`,
        this.generateRenderActions(), `\n`,
        `  };\n`,
        `\n`
      ]);
    }

    sn.add([
      `  // Set root nodes\n`,
      `  view.nodes = [`, sourceNode(this.children).join(`, `), `];\n`,
      `  return view;\n`
    ]);

    sn.add(`}`);

    return sn;
  }

  generateFunctions() {
    if (Object.keys(this.functions).length > 0) {
      var defn = [];
      Object.keys(this.functions).forEach((key) => {
        defn.push(sourceNode(null, `${key} = ${this.functions[key]}`));
      });
      return sourceNode(null, `var `).add(join(defn, `,\n`)).add(`;\n`);
    } else {
      return sourceNode(null, ``);
    }
  }

  generateSpots() {
    var parts = [];

    Object.keys(this.spots).forEach((reference) => {
      let spot = this.spots[reference];
      parts.push(sourceNode([`    `, spot.reference, `: `, spot.generate()]).join(`, `));
    });

    return sourceNode(null, parts).join(`,\n`);
  }

  generateRenderActions() {
    var parts = [];
    for (var control of this.renderActions) {
      parts.push(control);
    }
    return join(parts, `\n`);
  }

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0
    }
    return this.uniqCounters[name]++;
  }

  spot(variables) {
    let s = new Spot(variables);
    if (!this.spots.hasOwnProperty(s.reference)) {
      this.spots[s.reference] = s;
    }
    return this.spots[s.reference];
  }

  declare(node) {
    this.declarations.push(node);
  }

  construct(node) {
    this.constructions.push(node);
  }

  addFunction(name, source) {
    if (!this.functions.hasOwnProperty(name)) {
      this.functions[name] = source;
    }
  }

  addFigure(figure) {
    this.subFigures.push(figure);
  }
}
