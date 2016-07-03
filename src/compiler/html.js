import { sourceNode } from './sourceNode';
import { notNull } from '../utils';

export default {
  Element: ({node, figure, compile, options}) => {
    node.reference = node.name + figure.uniqid();
    const _var = options.ecmaVersion < 6 ? 'var' : 'const';

    figure.declare(
      sourceNode(node.loc, `${_var} ${node.reference} = document.createElement('${node.name}');`)
    );

    let children = node.body.map((child) => compile(child)).filter(notNull);

    for (let child of children) {
      figure.construct(
        sourceNode(`${node.reference}.appendChild(${child});`)
      );
    }

    node.attributes.map((child) => compile(child));

    return node.reference;
  }
};
