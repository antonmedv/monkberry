export function collectVariables(expr) {
  var variables = [];

  if (!expr.visit) {
    throw new Error(`Can not collect variables for node "${expr.type}" type.`);
  }

  expr.visit((node) => {
    if (node.type == 'Identifier') {
      if (variables.indexOf(node.name) == -1) {
        variables.push(node.name);
      }
    }
  });

  return variables;
}
