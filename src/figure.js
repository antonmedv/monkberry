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
    this.imports = [];
    this.declarations = [];
    this.constructions = [];
    this.directives = [];
    this.renderActions = [];
    this.subFigures = [];
    this.spots = {};
    this.scope = [];
    this.onUpdate = [];
    this.onRemove = [];
    this.thisRef = false;
  }

  generate() {
    let sn = sourceNode(``);

    if (this.imports.length > 0) {
      sn.add(sourceNode(this.imports).join(`\n`));
      sn.add(`\n`);
    }

    if (size(this.functions) > 0) {
      sn.add(`\n`);
      sn.add(this.generateFunctions());
    }

    sn.add([
      `\n`,
      `/**\n`,
      ` * @class\n`,
      ` */\n`,
      `function ${this.name}() {\n`,
      `  Monkberry.call(this);\n`
    ]);

    if (this.isCacheNeeded()) {
      sn.add(`  this.__cache__ = {};\n`);
    }

    if (this.thisRef) {
      sn.add(`  var _this = this;\n`);
    }

    sn.add(`\n`);

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

    if (this.directives.length > 0) {
      sn.add([
        `  // Directives\n`,
        `  `, sourceNode(null, this.directives).join(`\n  `),
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
        `  this.onRender = function () {\n`,
        sourceNode(this.renderActions).join(`\n`), `\n`,
        `  };\n`,
        `\n`
      ]);
    }

    if (this.onUpdate.length > 0) {
      sn.add([
        `  // On update actions\n`,
        `  this.onUpdate = function (__data__) {\n`,
        sourceNode(this.onUpdate).join(`\n`), `\n`,
        `  };\n`,
        `\n`
      ]);
    }

    if (this.onRemove.length > 0) {
      sn.add([
        `  // On remove actions\n`,
        `  this.onRemove = function (__data__) {\n`,
        sourceNode(this.onRemove).join(`\n`), `\n`,
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
      `${this.name}.prototype.constructor = ${this.name};\n`,
      `${this.name}.pool = [];\n`
    ]);

    sn.add(this.generateUpdateFunction());

    for (let subfigure of this.subFigures) {
      sn.add(subfigure.generate());
    }

    return sn;
  }

  generateFunctions() {
    var defn = [];
    Object.keys(this.functions).forEach((key) => {
      defn.push(sourceNode(`${key} = ${this.functions[key]}`));
    });
    return sourceNode(`var `).add(sourceNode(defn).join(`,\n`)).add(`;\n`);
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

  generateUpdateFunction() {
    let sn = sourceNode(
      `${this.name}.prototype.update = function (__data__) {\n`
    );

    let spots = Object.keys(this.spots).map(key => this.spots[key]).sort((a, b) => a.length - b.length);

    for (let spot of spots) {
      if (spot.length == 1) {
        let name = spot.variables[0];

        sn.add(`  if (__data__.${name} !== undefined`);
        if (spot.onlyFromLoop) {
          sn.add(` && __data__.__index__ !== undefined`);
        }
        sn.add(`) {\n`);

        if (spot.cache) {
          sn.add(`    this.__cache__.${name} = __data__.${name};\n`);
        }

        if (spot.operators.length > 0) {
          sn.add(`    this.__update__.${spot.reference}(__data__.${name});\n`);
        }

        sn.add(`  }\n`);
      } else {

        let cond = sourceNode(spot.variables.map(name => `this.__cache__.${name} !== undefined`)).join(` && `);
        let params = sourceNode(spot.variables.map(name => `this.__cache__.${name}`)).join(`, `);

        sn.add([
          `  if (`, cond, `) {\n`,
          `    this.__update__.${spot.reference}(`, params, `);\n`,
          `  }\n`
        ]);
      }
    }

    if (this.onUpdate.length > 0) {
      sn.add(`  this.onUpdate(__data__);\n`);
    }

    sn.add(`};\n`);
    return sn;
  }

  uniqid(name = 'default') {
    if (!this.uniqCounters[name]) {
      this.uniqCounters[name] = 0;
    }
    return this.uniqCounters[name]++;
  }

  hasSpot(variables) {
    return this.spots.hasOwnProperty(
      new Spot([].concat(variables)).reference
    );
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

  isCacheNeeded() {
    let needed = false;

    Object.keys(this.spots)
      .map(x => this.spots[x])
      .forEach(spot => {
        if (spot.variables.length > 1) {
          needed = true;
        }
        if (spot.cache) {
          needed = true;
        }
      });

    return needed;
  }


  root() {
    if (this.parent) {
      return this.parent.root();
    } else {
      return this;
    }
  }

  getScope() {
    if (this.parent) {
      return [].concat(this.scope).concat(this.parent.getScope());
    } else {
      return this.scope;
    }
  }

  addToScope(variable) {
    this.scope.push(variable);
  }

  isInScope(variable) {
    return this.getScope().indexOf(variable) != -1;
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

  addRenderActions(action) {
    this.renderActions.push(action);
  }

  addImport(source) {
    this.imports.push(source);
  }

  addOnUpdate(node) {
    this.onUpdate.push(node);
  }

  prependOnUpdate(node) {
    this.onUpdate.unshift(node);
  }

  addOnRemove(node) {
    this.onRemove.push(node);
  }

  addDirective(node) {
    this.directives.push(node);
  }
}
