import { parser } from '../parser';
import { Figure } from './figure';
import { sourceNode } from './compiler/sourceNode';
import expression from './compiler/expression';
import visitor from './compiler/expression/visitor';
import document from './compiler/document';
import element from './compiler/element';
import text from './compiler/text';
import if_ from './compiler/if';



import { drawGraph } from './graph';




export default class Compiler {
  constructor() {
    this.sources = [];

    // Extend AST with compilers.
    document(parser.ast);
    element(parser.ast);
    expression(parser.ast);
    visitor(parser.ast);
    text(parser.ast);
    if_(parser.ast);
  }

  addSource(name, code) {
    this.sources.push([name, code]);
  }

  compile(asModule = false) {
    var figures = sourceNode(null, '');

    for (let [name, code] of this.sources) {
      var ast = parser.parse(code, name);
      var figure = new Figure(name.replace(/\.\w+$/, ''));

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
