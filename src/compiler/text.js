import { sourceNode } from './sourceNode';

export default function (ast) {
  ast.TextNode.prototype.compile = function (figure) {
    if (this.text.replace(/^\s+|\s+$/g, '') === '') {
      // Skip creating of empty text nodes.
      return null;
    }

    this.nodeName = 'text' + figure.uniqid();

    figure.declarations.push(
      // Trim new lines and white spaces to a single whitespace.
      sourceNode(this.loc, [this.nodeName, " = document.createTextNode('", this.text.replace(/^\s+|\s+$/g, ' '), "')"])
    );

    return this.nodeName;
  };
}
