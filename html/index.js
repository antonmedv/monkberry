var fs = require('fs');
var asciitree = require('asciitree');
var parser = require('./grammar').parser;

var code = fs.readFileSync('template.twig', {encoding: 'utf8'});

code = code.replace(/(}}|%}|>)\s+(<|{%|{{)/g, '$1$2');

var ast = parser.parse(code);

console.log(asciitree(
    ast,
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
              });
        }
      } else {
        return [];
      }
    })
);
