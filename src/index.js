import { parser } from './parser';
import { compile } from './compiler';
import { entity } from './transform/entity';
import { whitespace } from './optimize/whitespace';
import { getTemplateName } from './utils';
import { drawGraph } from './graph';

export class Compiler {
  constructor(options = {}) {
    this.options = Object.assign({
      asModule: true
    }, options);
    this.transforms = [whitespace, entity];
    this.globals = [
      'window',
      'Array',
      'Object',
      'Math',
      'JSON'
    ];
  }

  compile(filename, code) {
    let ast = parser.parse(filename, code);

    // Transform.
    this.transforms.forEach(transform => transform(ast));

    return compile(getTemplateName(getBaseName(filename)), ast, this.options, this.globals);
  }

  drawAstTree(filename, code) {
    let ast = parser.parse(filename, code);

    // Transform.
    this.transforms.forEach(transform => transform(ast));

    return drawGraph(ast);
  }
}

function getBaseName(name) {
  return name.split('/').pop().replace(/\.\w+$/, '');
}
