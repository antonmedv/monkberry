import { parser } from 'monkberry-parser';
import { Figure } from './figure';
import { Root } from './figure/root';
import { visitor } from './visitor';
import { config } from './config';
import { sourceNode } from './compiler/sourceNode';
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
import { whitespace } from './optimize/whitespace';
import { nestedBlocks } from './optimize/nestedBlocks';
import { entity } from './transform/entity';
import { drawGraph } from './graph';

export class Compiler {
  constructor() {
    this.sources = [];
    this.parsers = {'default': parser};
    this.transforms = {whitespace, nestedBlocks, entity};
    this.globals = [];
  }

  addSource(name, code, parser = 'default', asLibrary = false) {
    this.sources.push([name, code, parser, asLibrary]);
  }

  enhanceParsers() {
    Object.keys(this.parsers).forEach((type) => {
      var parser = this.parsers[type];

      // Extend AST with compilers.
      document(parser.ast);
      element(parser.ast);
      html(parser.ast);
      svg(parser.ast);
      custom(parser.ast);
      attribute(parser.ast);
      expression(parser.ast);
      text(parser.ast);
      comment(parser.ast);
      import_(parser.ast);
      if_(parser.ast);
      for_(parser.ast);
      block(parser.ast);
      unsafe(parser.ast);
      visitor(parser.ast);

    });
  }

  updateConfig() {
    config.globals = this.globals;
  }

  compile(asModule = false) {
    this.enhanceParsers();
    this.updateConfig();

    var root = new Root();
    var figures = sourceNode(null, '');

    for (let [name, code, parserType, asLibrary] of this.sources) {
      if (parserType in this.parsers) {
        var parser = this.parsers[parserType];

        var ast = parser.parse(code, name);

        // Transforms
        Object.keys(this.transforms).forEach((key) => this.transforms[key](ast, parser));

        var figure = new Figure(this.getTemplateName(name), root);

        if (asLibrary) {
          figure.perceivedAsLibrary = true;
        }

        figures.add(ast.compile(figure));

      } else {
        throw Error(`Unknown parser ${parserType}.`);
      }
    }

    var output = sourceNode(null, '');
    if (asModule) {
      output
        .add('module.exports = function (monkberry, document) {\n')
        .add('var __filters = monkberry.filters;\n')
        .add(root.compile())
        .add('return {\n')
        .add(figures.join(',\n'))
        .add('};\n')
        .add('};\n');
    } else {
      output
        .add('(function (monkberry, document) {\n')
        .add('var __filters = monkberry.filters;\n')
        .add(root.compile())
        .add('monkberry.mount({\n')
        .add(figures.join(',\n'))
        .add('\n});\n')
        .add('})(monkberry, window.document);\n');
    }

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
