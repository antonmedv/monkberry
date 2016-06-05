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
    var sn = sourceNode([
      `\n`,
      `function ${this.name}() {\n`,
      `  Monkberry.call(this);\n`,
      `  var _this = this;\n`,
      `\n`
    ]);

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
      `  this.nodes = [`, sourceNode(this.children).join(`, `), `];\n`
    ]);

    sn.add(`}\n`);

    sn.add([
      `${this.name}.prototype = Object.create(Monkberry.prototype);\n`,
      `${this.name}.prototype.constructor = ${this.name};\n`
    ]);

    sn.add(this.generateUpdateFunction());

    for (let subfigure of this.subFigures) {
      sn.add(subfigure.generate());
    }

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

    Object.keys(this.spots)
      .map(x => this.spots[x])
      .filter(spot => spot.operators.length > 0)
      .map(spot => {
        parts.push(
          sourceNode([`    `, spot.reference, `: `, spot.generate()])
        );
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

  generateUpdateFunction() {
    let sn = sourceNode(
      `${this.name}.prototype.update = function (__data__) {\n`
    );

    let spots = Object.keys(this.spots).map(key => this.spots[key]).sort((a, b) => a.length - b.length);

    for (let spot of spots) {
      if (spot.length == 1) {
        let name = spot.variables[0];
        sn.add(`  if (__data__.${name}) {\n`);

        if (spot.cache) {
          sn.add(`    this.__cache__.${name} = __data__.${name};\n`);
        }

        if (spot.operators.length > 0) {
          sn.add(`    this.__update__.${spot.reference}(__data__, __data__.${name});\n`);
        }

        sn.add(`  }\n`);
      } else {

        let variables = spot.variables.map(name => `this.__cache__.${name}`);

        sn.add([
          `  if (`, sourceNode(variables).join(` && `), `) {\n`,
          `    this.__update__.${spot.reference}(__data__, `, sourceNode(variables).join(`, `), `);\n`,
          `  }\n`
        ]);
      }
    }

    sn.add(`}\n`);
    return sn;
  }

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0
    }
    return this.uniqCounters[name]++;
  }

  spot(variables) {
    let s = new Spot([].concat(variables));

    if (!this.spots.hasOwnProperty(s.reference)) {
      this.spots[s.reference] = s;

      if (s.variables.length > 1) {
        for (let variable of s.variables) {
          this.spot(variable).cache = true;
        }
      }
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
