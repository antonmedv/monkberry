import { parser } from 'monkberry-parser';
import { compile } from './compiler';
import { Figure } from './figure';
import { Root } from './figure/root';
import { config } from './config';
import { sourceNode } from './compiler/sourceNode';
import { whitespace } from './optimize/whitespace';
import { nestedBlocks } from './optimize/nestedBlocks';
import { entity } from './transform/entity';
import { drawGraph } from './graph';


export class Compiler {
  constructor() {
    this.transforms = {whitespace, nestedBlocks, entity};
    this.globals = ['window', 'Math'];
  }

  compile(filename, code) {
    let ast = parser.parse(code);

    // Transform.
    Object.keys(this.transforms).forEach((key) => this.transforms[key](ast));
    
    return compile(getTemplateName(filename), ast);
  }
}

export class Compiler_v1 {
  constructor() {
    this.sources = [];
    this.transforms = {whitespace, nestedBlocks, entity};
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

  getTemplateName(name) {
    return name.split('/').pop().replace(/\.\w+$/, '');
  }
}

function getTemplateName(name) {
  return name.split('/').pop().replace(/\.\w+$/, '');
}
