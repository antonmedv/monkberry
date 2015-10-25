export function collectVariables(node) {
  var variables = [];
  if (node) {
    var nodes = [].concat(node);
    nodes.forEach((node) => {
      if (!node.visit) {
        throw new Error('Can not collect variables for node "' + node.type + '" type.');
      }

      node.visit(function (node) {
        if (node.type == 'Identifier') {
          if (variables.indexOf(node.name) == -1) {
            variables.push(node.name);
          }
        }
      });
    });
  }
  return variables;
}
