import {parser} from 'monkberry-parser';
import {Figure} from './figure';
import {Root} from './figure/root';
import {visitor} from './visitor';
import {config} from './config';
import {sourceNode} from './compiler/sourceNode';
import expression from './compiler/expression';
import document from './compiler/document';
import element from './compiler/element';
import html from './compiler/element/html';
import svg from './compiler/element/svg';
import custom from './compiler/element/custom';
import attribute from './compiler/attribute';
import text from './compiler/text';
import comment from './compiler/comment';
import import_ from './compiler/import';
import if_ from './compiler/if';
import for_ from './compiler/for';
import block from './compiler/block';
import unsafe from './compiler/unsafe';
import {whitespace} from './optimize/whitespace';
import {nestedBlocks} from './optimize/nestedBlocks';
import {entity} from './transform/entity';
import {drawGraph} from './graph';


export class Compiler_v2 {
  constructor() {
    this.transforms = {whitespace, nestedBlocks, entity};
    this.globals = ['window', 'Math'];
  }

  compile(filename, code) {
    let ast = parser.parse(code);

    // Transform.
    Object.keys(this.transforms).forEach((key) => this.transforms[key](ast));

    


    return sourceNode([
      'module.exports = function (monkberry, document) {\n',
      'var __filters = monkberry.filters;\n',
      root.compile(),
      'return {\n',
      figures.join(',\n'),
      '};\n',
      '};\n'
    ]);
  }
}

export class Compiler {
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
