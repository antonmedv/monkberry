export function whitespace(ast) {
  ast.visit((node) => {
    if (node.type == 'Document') {
      trim(node, 'body');
    } else if (node.type == 'Element') {
      trim(node, 'body');
    } else if (node.type == 'IfStatement') {
      trim(node, 'then');
      trim(node, '_else');
    } else if (node.type == 'ForStatement') {
      trim(node, 'body');
    } else if (node.type == 'BlockStatement') {
      trim(node, 'body');
    }
  });
}


function trim(node, key) {
  var skipped = false,
   nodes = [];

  if (!node[key]) {
    return;
  }

  // Skip empty text nodes.
  for (let i = 0; i < node[key].length; i++) {
    if (node[key][i].type == 'Text') {
      if (node[key][i].text.replace(/^\s+|\s+$/g, '') === '') {
        skipped = true;
        continue; // Skip this node.
      }
    }

    nodes.push(node[key][i]);
  }

  if (skipped) {
    node[key] = nodes;
  }
}