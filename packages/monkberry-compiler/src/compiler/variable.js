const { visit } =require( './visitor')

function collectVariables(scope, node) {
  var variables = [];
  if (node) {
    var nodes = [].concat(node);
    nodes.forEach((node) => {
      visit(node, {
        Identifier: (node) => {
          if (variables.indexOf(node.name) == -1 && scope.indexOf(node.name) == -1) {
            variables.push(node.name);
          }
        }
      });
    });
  }
  return variables;
}

module.exports = {collectVariables}
