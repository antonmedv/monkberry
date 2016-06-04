import { config } from '../../config';
import { visit } from '../../visitor';

export function collectVariables(node) {
  var variables = [];
  if (node) {
    var nodes = [].concat(node);
    nodes.forEach((node) => {
      visit(node, {
        Identifier: (node) => {
          if (variables.indexOf(node.name) == -1 && config.globals.indexOf(node.name) == -1) {
            variables.push(node.name);
          }
        }
      });
    });
  }
  return variables;
}
