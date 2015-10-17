import { sourceNode } from './sourceNode';

export default function (ast) {
  ast.TextNode.prototype.compile = function (figure) {
    this.nodeName = 'text' + figure.uniqid();

    figure.declarations.push(
      sourceNode(this.loc, [this.nodeName, " = document.createTextNode('", this.text, "')"])
    );

    return this.nodeName;
  };
}
