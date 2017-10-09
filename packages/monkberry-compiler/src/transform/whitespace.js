import {visit} from '../compiler/visitor';

export function whitespace(ast) {
  visit(ast, {
    Document: (node) => {
      trim(node, 'body');
    },
    Element: (node) => {
      trim(node, 'body');
    },
    IfStatement: (node) => {
      trim(node, 'then');
      trim(node, 'otherwise');
    },
    ForStatement: (node) => {
      trim(node, 'body');
    },
    BlockStatement: (node) => {
      trim(node, 'body');
    }
  });
}

function trim(node, key) {
  let skipped = false,
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
