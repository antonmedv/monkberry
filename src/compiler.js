import { parser } from '../parser';
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
import { trimWhitespaces } from './optimize/whitespace';

export default class Compiler {
  constructor() {
    this.sources = [];

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
  }

  addSource(name, code, asLibrary = false) {
    this.sources.push([name, code, asLibrary]);
  }

  compile(asModule = false) {
    var figures = sourceNode(null, '');

    for (let [name, code, asLibrary] of this.sources) {
      var ast = parser.parse(code, name);

      // Optimization
      trimWhitespaces(ast);

      var figure = new Figure(name.replace(/\.\w+$/, ''));
      if (asLibrary) {
        figure.perceivedAsLibrary = true;
      }

      figures.add(ast.compile(figure));
    }

    var output = sourceNode(null, '');
    if (asModule) {
      output
        .add('module.exports = function (monkberry, document) {\n')
        .add('var filters = monkberry.filters;\n')
        .add('return {\n')
        .add(figures)
        .add('};\n')
        .add('};\n');
    } else {
      output
        .add('(function (monkberry, filters, document, undefined) {\n')
        .add('monkberry.mount({\n')
        .add(figures)
        .add('\n});\n')
        .add('})(monkberry, monkberry.filters, window.document, void 0);\n');
    }

    return output;
  }
}
