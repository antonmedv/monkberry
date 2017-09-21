import asciitree from 'asciitree';

export function drawGraph(ast) {
  return ast.body.map((root) => asciitree(
    root,
    function (node) {
      if (node.type) {
        switch (node.type) {
          case 'BinaryExpression':
            return '( ' + node.operator + ' )';
          case 'Identifier':
            return node.name;
          case 'Literal':
            return node.value.toString();
          case 'Accessor':
            return '.' + node.name;
          case 'Element':
            return '<' + node.name + '>';
          case 'Text':
            return '"' + node.text.replace(/[\s]+/g, '') + '"';
          default:
            return node.type;
        }
      } else {
        return JSON.stringify(node);
      }
    },
    function (node) {
      if (node instanceof Object) {
        switch (node.type) {
          case 'BinaryExpression':
            return [node.left, node.right];
          case  'Identifier':
            return [];
          case  'Literal':
            return [];
          case  'Accessor':
            return [];
          case 'Element':
            return node.body.concat(node.attributes);
          case 'Text':
            return [];
          case 'ObjectExpression':
            return [];
          case undefined:
            return [];
          default:
            return Object.keys(node)
              .filter(function (key) {
                return ['type', 'loc'].indexOf(key) == -1;
              })
              .map(function (key) {
                if (node[key]) {
                  return [].concat(node[key]);
                } else {
                  return [];
                }
              })
              .reduce(function (a, b) {
                return a.concat(b);
              }, []);
        }
      } else {
        return [];
      }
    }
  )).filter((tree) => tree != '""').join('\n\n');
}
