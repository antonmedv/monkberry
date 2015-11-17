import { parser } from 'monkberry-parser';
import { Figure } from './figure';
import { visitor } from './visitor';
import { sourceNode } from './compiler/sourceNode';
import expression from './compiler/expression';
import document from './compiler/document';
import element from './compiler/element';
import html from './compiler/element/html';
import svg from './compiler/element/svg';
import custom from './compiler/element/custom';
import attribute from './compiler/attribute';
import text from './compiler/text';
import if_ from './compiler/if';
import for_ from './compiler/for';
import { whitespace } from './optimize/whitespace';

export class Compiler {
  constructor() {
    this.sources = [];
    this.parsers = {'default': parser};
    this.transforms = {whitespace};
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
      if_(parser.ast);
      for_(parser.ast);
      visitor(parser.ast);

    });
  }

  compile(asModule = false) {
    this.enhanceParsers();

    var figures = sourceNode(null, '');

    for (let [name, code, parserType, asLibrary] of this.sources) {
      if (parserType in this.parsers) {
        var parser = this.parsers[parserType];

        var ast = parser.parse(code, name);

        // Transforms
        Object.keys(this.transforms).forEach((key) => this.transforms[key](ast, parser));

        var figure = new Figure(this.getTemplateName(name));
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
        .add('var filters = monkberry.filters;\n')
        .add('return {\n')
        .add(figures.join(',\n'))
        .add('};\n')
        .add('};\n');
    } else {
      output
        .add('(function (monkberry, filters, document, undefined) {\n')
        .add('monkberry.mount({\n')
        .add(figures.join(',\n'))
        .add('\n});\n')
        .add('})(monkberry, monkberry.filters, window.document, void 0);\n');
    }

    return output;
  }

  getTemplateName(name) {
    return name.split('/').pop().replace(/\.\w+$/, '');
  }
}
