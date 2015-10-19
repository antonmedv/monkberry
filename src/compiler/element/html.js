import { sourceNode } from '../sourceNode';
import { map } from '../../utils';

export default function (ast) {
  ast.ElementNode.prototype.compileHtml = function (figure) {
    this.nodeName = this.name + figure.uniqid();

    figure.declarations.push(
      sourceNode(this.loc, [this.nodeName, " = document.createElement('", this.name, "')"])
    );

    var children = map(this.body, (node) => {
      node.parent = this; // This is needed for backward lookup then optimizing "if" and "for".
      return node.compile(figure);
    });

    for (var child of children) {
      figure.construct.push(
        sourceNode(this.loc, [this.nodeName, ".appendChild(", child, ");"])
      );
    }

    this.attributes.map((attr) => attr.compile(figure, this.nodeName));

    return this.nodeName;
  };
}
