const { sourceNode } =require( './sourceNode')
const { notNull } =require( '../utils')

module.exports = {
  Element: ({node, figure, compile}) => {
    node.reference = node.name + figure.uniqid();

    figure.declare(sourceNode(node.loc,
      `var ${node.reference} = document.createElementNS('http://www.w3.org/2000/svg', '${node.name}');`
    ));

    let children = node.body.map((child) => compile(child)).filter(notNull);

    for (let child of children) {
      figure.construct(
        sourceNode(`${node.reference}.appendChild(${child});`)
      );
    }

    node.attributes.map((child) => compile(child));

    return node.reference;
  }
}
