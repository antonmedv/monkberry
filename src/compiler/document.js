import { sourceNode } from './sourceNode';
import { notNull } from '../utils';

export default {
  Document: ({node, figure, compile, options}) => {
    figure.children = node.body.map((child) => compile(child)).filter(notNull);
    const { ecmaVersion } = options;

    if (options.asModule) {
      return sourceNode(node.loc, [
        ecmaVersion < 6
          ? `var Monkberry = require('monkberry');\n`
          : `import Monkberry from 'monkberry';\n`,
        figure.generate(), `\n`,
        ecmaVersion < 6
          ? `module.exports = ${figure.name};\n`
          : `export default ${figure.name};\n`
      ]);
    } else {
      return sourceNode(node.loc, [
        figure.generate(), `\n`,
        `window.${figure.name} = ${figure.name};\n`
      ]);
    }
  }
};
