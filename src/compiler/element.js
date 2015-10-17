import { sourceNode } from './sourceNode';

export default function (ast) {
  ast.ElementNode.prototype.compile = function (figure) {
    this.nodeName = this.name + figure.uniqid();

    figure.declarations.push(
      sourceNode(this.loc, [this.nodeName, " = document.createElement('", this.name, "')"])
    );

    var children = this.body.map((node) => node.compile(figure));
    for (var child of children) {
      figure.construct.push(
        sourceNode(this.loc, [this.nodeName, ".appendChild(", child, ");"])
      );
    }

    this.attributes.map((attr) => attr.compile(figure, this.nodeName));

    return this.nodeName;
  };
}
