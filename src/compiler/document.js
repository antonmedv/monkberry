import { sourceNode } from './sourceNode';
import { notNull } from '../utils';

export default {
  Document: ({node, figure, compile}) => {
    figure.children = node.body.map((child) => compile(child)).filter(notNull);

    return sourceNode(node.loc, [
      `var Monkberry = typeof require !== 'undefined' ? require('monkberry') : Monkberry;\n`,
      figure.generate(),
      `\n`,
      `if (typeof module !== 'undefined') {\n`,
      `  module.exports = ${figure.name};\n`,
      `} else {\n`,
      `  window.${figure.name} = ${figure.name};\n`,
      `}`
    ]);
  }
};


