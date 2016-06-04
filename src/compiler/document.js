import { sourceNode } from './sourceNode';
import { notNull } from '../utils';

export default {
  Document: ({node, figure, compile}) => {
    figure.children = node.body.map((child) => compile(child)).filter(notNull);

    return sourceNode(node.loc, [
      `var Monkberry = require('monkberry');\n`,
      figure.generate()
    ]);
  }
};


