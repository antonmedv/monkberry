import { sourceNode } from '../sourceNode';
import { map } from '../../utils';

export default {
  ElementNode: (node) => {
    node.nodeName = node.name + figure.uniqid();

    figure.declarations.push(
      sourceNode(node.loc, `var ${this.nodeName} = document.createElement('${node.name}');`)
    );

    var children = map(this.body, (node) => {
      node.parent = this;
      return node.compile(figure);
    });

    for (var child of children) {
      figure.construct.push(
        sourceNode(this.loc, [this.nodeName, ".appendChild(", child, ");"])
      );
    }

    this.attributes.map((attr) => attr.compile(figure, this.nodeName));

    return this.nodeName;
  }
};
