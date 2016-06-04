import { sourceNode } from './sourceNode';

export default {
  Element: ({node, figure, compile}) => {
    node.reference = node.name + figure.uniqid();

    figure.declarations.push(sourceNode(node.loc,
      `var ${node.reference} = document.createElementNS('http://www.w3.org/2000/svg', '${node.name}');`
    ));

    let children = node.body.map((child) => compile(child));

    for (let child of children) {
      figure.construct.push(
        sourceNode(`${node.reference}.appendChild(${child});`)
      );
    }

    node.attributes.map((child) => compile(child));

    return this.nodeName;
  }
}
