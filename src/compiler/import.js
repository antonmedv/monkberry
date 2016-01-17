import { sourceNode } from './sourceNode';
import { esc } from '../utils';

export default function (ast) {
  ast.ImportStatementNode.prototype.compile = function (figure) {
    figure.root.addImport(this.loc, this.path.value);
    return null;
  };
}
