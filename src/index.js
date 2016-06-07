import { parser } from 'monkberry-parser';
import { compile } from './compiler';
import { entity } from './transform/entity';
import { whitespace } from './optimize/whitespace';
import { sourceNode } from './compiler/sourceNode';
import { getTemplateName } from './utils';
import { drawGraph } from './graph';

export class Compiler {
  constructor(options = {}) {
    this.options = Object.assign({
      asModule: true
    }, options);
    this.transforms = {whitespace, entity};
    this.globals = ['window', 'Math'];
  }

  compile(filename, code) {
    let ast = parser.parse(filename, code);

    // Transform.
    Object.keys(this.transforms).forEach((key) => this.transforms[key](ast));

    return compile(getTemplateName(getBaseName(filename)), ast, this.options, this.globals);
  }
}

export class Compiler_v1 {
  constructor() {
    this.sources = [];
    this.transforms = {whitespace, entity};
    this.globals = [];
  }

  addSource(name, code) {
    this.sources.push([name, code]);
  }

  updateConfig() {
    config.globals = this.globals;
  }

  compile() {
    this.updateConfig();

    let root = new Root();
    let figures = sourceNode(null, '');

    for (let [name, code] of this.sources) {
      let ast = parser.parse(code, name);

      // Transforms
      Object.keys(this.transforms).forEach((key) => this.transforms[key](ast));

      var figure = new Figure(this.getTemplateName(name), root);

      if (asLibrary) {
        figure.perceivedAsLibrary = true;
      }

      figures.add(ast.compile(figure));
    }

    var output = sourceNode(null, '');
    output
      .add('module.exports = function (monkberry, document) {\n')
      .add('var __filters = monkberry.filters;\n')
      .add(root.compile())
      .add('return {\n')
      .add(figures.join(',\n'))
      .add('};\n')
      .add('};\n');

    return output;
  }

  drawAstTree() {
    this.enhanceParsers();

    if (this.sources.length > 0) {
      let [name, code, parserType, ] = this.sources[0];
      if (parserType in this.parsers) {

        var parser = this.parsers[parserType];
        var ast = parser.parse(code, name);

        // Transforms
        Object.keys(this.transforms).forEach((key) => this.transforms[key](ast, parser));

        return drawGraph(ast);

      } else {
        throw new Error(`Unknown parser type: ${parserType}.`)
      }
    } else {
      throw new Error('No sources.');
    }
  }
}

function getBaseName(name) {
  return name.split('/').pop().replace(/\.\w+$/, '');
}
