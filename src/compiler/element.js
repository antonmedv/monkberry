import { sourceNode } from './sourceNode';
import { map } from '../utils';
import { HTMLElements, SVGElements } from './element/types';

export default function (ast) {
  ast.ElementNode.prototype.compile = function (figure) {
    if (HTMLElements.indexOf(this.name) != -1) {
      return this.compileHtml(figure);
    } else if (SVGElements.indexOf(this.name) != -1) { // TODO: Use path info for detecting SVG elements.
      return this.compileSvg(figure);
    } else {
      return this.compileCustom(figure);
    }
  };
}
