import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';

export default {
  ExpressionStatement: ({node, compile, figure}) => {
    node.reference = 'text' + figure.uniqid();

    let defaultValue = `''`;

    if (node.expression.type == 'LogicalExpression' && node.expression.operator == '||') {
      // Add as default right side of "||" expression if there are no variables.
      if (collectVariables(node.expression.right) == 0) {
        defaultValue = compile(node.expression.right);
      }
    }

    figure.declare(
      sourceNode(`var ${node.nodeName} = document.createTextNode(${defaultValue})`)
    );

    let variables = collectVariables(node.expression);

    if (variables.length == 0) {
      figure.construct(
        sourceNode(node.loc, [node.reference, '.textContent = ', compile(node.expression)])
      );
    } else {
      figure.spot(variables).add(
        sourceNode(node.loc, [node.reference, '.textContent = ', compile(node.expression)])
      );
    }

    return node.references;
  },

  FilterExpression: ({node, compile}) => {
    var sn = sourceNode(node.loc, ['__filters.', compile(node.callee), '(']);

    for (let i = 0; i < node.arguments.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(compile(node.arguments[i]));
    }

    return sn.add(')');
  },

  ArrayExpression: ({node, compile}) => {
    var sn = sourceNode(node.loc, '[');
    var elements = node.elements;

    for (var i = 0; i < node.elements.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(compile(elements[i]));
    }

    return sn.add(']');
  },

  ObjectExpression: ({node, compile}) => {
    var sn = sourceNode(node.loc, '({');

    for (let i = 0; i < node.properties.length; i++) {
      var prop = node.properties[i];
      var kind = prop.kind;
      var key = prop.key;
      var value = prop.value;

      if (i !== 0) {
        sn.add(', ');
      }

      if (kind === 'init') {
        sn.add([compile(key), ': ', compile(value)]);
      } else {
        var params = value.params;
        var body = value.body;

        sn.add([kind, ' ', compile(key), '(']);

        for (let j = 0; j < params.length; j++) {
          if (j !== 0) {
            sn.add(', ');
          }

          sn.add(compile(params[j]));
        }

        sn.add(') { ');

        for (let j = 0; j < body.length; j++) {
          sn.add([compile(body[j]), ' ']);
        }

        sn.add('}');
      }
    }

    return sn.add('})');
  },

  SequenceExpression: ({node, compile}) => {
    var sn = sourceNode(node.loc, '');

    for (var i = 0; i < node.expressions.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(compile(node.expressions[i]));
    }

    return sn;
  },

  UnaryExpression: ({node, compile}) => {
    if (node.operator == 'delete' || node.operator == 'void' || node.operator == 'typeof') {
      return sourceNode(node.loc, [node.operator, ' (', compile(node.argument), ')']);
    } else {
      return sourceNode(node.loc, [node.operator, '(', compile(node.argument), ')']);
    }
  },

  BinaryExpression: ({node, compile}) => {
    return sourceNode(node.loc, ['(', compile(node.left), ') ', node.operator, ' (', compile(node.right), ')']);
  },

  AssignmentExpression: ({node, compile}) => {
    return sourceNode(node.loc, ['(', compile(node.left), ') ', node.operator, ' (', compile(node.right), ')']);
  },

  UpdateExpression: ({node, compile}) => {
    if (node.prefix) {
      return sourceNode(node.loc, ['(', node.operator, compile(node.argument), ')']);
    } else {
      return sourceNode(node.loc, ['(', compile(node.argument), node.operator, ')']);
    }
  },

  LogicalExpression: ({node, compile}) => {
    return sourceNode(node.loc, ['(', compile(node.left), ') ', node.operator, ' (' + compile(node.right), ')']);
  },

  ConditionalExpression: ({node, compile}) => {
    return sourceNode(node.loc, ['(', compile(node.test), ') ? ', compile(node.consequent), ' : ', compile(node.alternate)]);
  },

  NewExpression: ({node, compile}) => {
    var sn = sourceNode(node.loc, ['new ', compile(node.callee)]);

    if (node.arguments !== null) {
      sn.add('(');

      for (var i = 0; i < node.arguments.length; i++) {
        if (i !== 0) {
          sn.add(', ');
        }

        sn.add(compile(node.arguments[i]));
      }

      sn.add(')');
    }

    return sn;
  },

  CallExpression: ({node, compile}) => {
    var sn = sourceNode(node.loc, [compile(node.callee), '(']);

    for (let i = 0; i < node.arguments.length; i++) {
      if (i !== 0) {
        sn.add(', ');
      }

      sn.add(compile(node.arguments[i]));
    }

    return sn.add(')');
  },

  MemberExpression: ({node, compile}) => {
    if (node.computed) {
      return sourceNode(node.loc, [compile(node.object), '[', compile(node.property), ']']);
    } else {
      return sourceNode(node.loc, [compile(node.object), '.', compile(node.property)]);
    }
  },

  Identifier: ({node}) => {
    return sourceNode(node.loc, node.name);
  },

  Accessor: ({node}) => {
    return sourceNode(node.loc, node.name);
  },

  Literal: ({node}) => {
    return sourceNode(node.loc, node.value.toString());
  }
};
