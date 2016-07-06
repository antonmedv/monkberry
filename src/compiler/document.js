import { sourceNode } from './sourceNode';
import { notNull } from '../utils';

export default {
  Document: ({node, figure, compile, options}) => {
    figure.children = node.body.map((child) => compile(child)).filter(notNull);

    if (options.asModule) {
      return sourceNode(node.loc, [
        `var Monkberry = require('monkberry');\n`,
        figure.generate(), `\n`,
        `exports.default = ${figure.name};\n`
      ]);
    } else {
      return sourceNode(node.loc, [
        figure.generate(), `\n`,
        `window.${figure.name} = ${figure.name};\n`
      ]);
    }
  }
};


