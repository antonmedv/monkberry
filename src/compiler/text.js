import { sourceNode } from './sourceNode';

export default function (ast) {
  ast.TextNode.prototype.compile = function (figure) {
    this.nodeName = 'text' + figure.uniqid();

    // Trim new lines and white spaces.
    var text = this.text.replace(/^\s+|\s+$/g, '');

    if (text === '') {
      // Skip creating of empty text nodes.
      return null;
    }

    figure.declarations.push(
      sourceNode(this.loc, [this.nodeName, " = document.createTextNode('", text, "')"])
    );

    return this.nodeName;
  };
}
