import { sourceNode } from './sourceNode';

export default function (ast) {
  ast.TextNode.prototype.compile = function (figure) {
    if (this.text.replace(/^\s+|\s+$/g, '') === '') {
      // Skip creating of empty text nodes.
      return null;
    }

    // Trim new lines and white spaces to a single whitespace.
    return sourceNode(this.loc, ["document.createTextNode('", this.text.replace(/^\s+|\s+$/g, ' '), "')"]);
  };
}
