import { sourceNode } from './compiler/sourceNode';
import { size } from './utils';
import { Spot } from './spot';

export class Figure {
  constructor(name, parent = null, options = {}) {
    this.name = name;
    this.parent = parent;
    this.options = options;
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
    this.spotMaxLength = 0;
  }

  generate() {
    const { ecmaVersion } = this.options;
    let sn = sourceNode(``);

    if (this.imports.length > 0) {
      sn.add(sourceNode(this.imports).join(`\n`));
      sn.add(`\n`);
    }

    if (size(this.functions) > 0) {
      sn.add(`\n`);
      sn.add(this.generateFunctions());
    }

    let src = '';

    if (ecmaVersion < 6) {
      sn.add(dedent`
        /**
         * @class ${this.name}
         */
        function ${this.name}() {
          Monkberry.call(this);

      `);
    } else {
      sn.add(dedent`
        /**
         * @class ${this.name}
         */
        class ${this.name} extends Monkberry {
          constructor() {
            super();

      `);
    }

    const indent = ecmaVersion < 6 ? '  ' : '    ';

    if (this.spotMaxLength > 1) {
      src += `this.__cache__ = {};\n`;
    }

    if (this.thisRef) {
      src += `var _this = this;\n`;
    }

    src += `\n`;

    if (this.declarations.length > 0) {
      src += dedent`
        // Create elements
        ${ sourceNode(this.declarations).join(`\n`) }
        

      `;
    }

    if (this.constructions.length > 0) {
      src += dedent`
        // Construct dom
        ${ sourceNode(null, this.constructions).join(`\n`) }
        

      `;
    }

    if (this.directives.length > 0) {
      src += dedent`
        // Directives
        ${ sourceNode(null, this.directives).join(`\n`) }
        

      `;
    }

    if (size(this.spots) > 0) {
      src += dedent`
        // Update functions
        this.__update__ = {
        ${this.generateSpots()}, 
        };
        
      `;
    }

    if (this.renderActions.length > 0) {
      src += dedent`
        // Extra render actions
        this.onRender = function () {
        ${sourceNode(this.renderActions).join(`\n`)}
        };
        
      `;
    }

    if (this.onUpdate.length > 0) {
      src += dedent`
        // On update actions
        this.onUpdate = function (__data__) {
          ${sourceNode(this.onUpdate).join(`\n`)}

        };
        
      `;
    }

    if (this.onRemove.length > 0) {
      src += dedent`
        // On remove actions
        this.onRemove = function (__data__) {
        ${sourceNode(this.onRemove).join(`\n`)}
        };
      `;
    }

    src += dedent`
      // Set root nodes
      this.nodes = [${ sourceNode(this.children).join(`, `) }];
    `;

    sn.add(indent + src.split('\n').join('\n' + indent));

    if (ecmaVersion < 6) {
      sn.add(dedent`

        }
        ${this.name}.prototype = Object.create(Monkberry.prototype);
        ${this.name}.prototype.constructor = ${this.name};
        ${this.name}.pool = [];

      `);      
    } else {
      sn.add(dedent`

          }
        }
        ${this.name}.pool = [];

      `);
    }
    
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

    sn.add(`};\n\n`);
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

        this.spotMaxLength = s.variables.length;
      }
    }

    return this.spots[s.reference];
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

  addOnRemove(node) {
    this.onRemove.push(node);
  }

  addDirective(node) {
    this.directives.push(node);
  }
}
