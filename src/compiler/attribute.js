import { ast } from 'monkberry-parser';
import { sourceNode, join } from './sourceNode';
import { collectVariables } from './expression/variable';
import { esc, arrayToObject } from '../utils';

/**
 * For this attributes doesn't work this:
 *
 *     node.setAttribute('value', ...);
 *
 * To change them, Monkberry generate code like this:
 *
 *     node.value = ...;
 *
 */
const plainAttributes = ['id', 'value', 'checked', 'selected'];

/**
 * This attributes take boolean values, not string values.
 */
const booleanAttributes = ['checked', 'selected'];

export default {
  /**
   * Compile attributes of regular nodes.
   *
   * @param {ElementNode} parent
   * @param {AttributeNode} node
   * @param {Figure} figure
   * @param {Function} compile
   */
  Attribute: ({parent, node, figure, compile}) => {
    let [expr, defaults] = compileToExpression(node, compile);

    var variables = collectVariables(expr);

    if (variables.length == 0) {
      figure.construct(sourceNode(node.loc, [
        attr(node.loc, parent.reference, node.name, (expr ? compile(expr) : defaultAttrValue(node.name)))
      ]));
    } else {
      // When rendering attributes with more then one variable,
      // Monkberry will wait for all data, before setting attribute.
      //
      //    <div class="{{ foo }} {{ bar }}">
      //
      // Then you pass only one variable, no update will happen:
      //
      //    view.update({foo});
      //
      // Now attribute will be set:
      //
      //    view.update({foo, bar});
      //

      // TODO: Implement updater, if one of expression contains default value.
      // Example (now this does not work):
      //
      //    <div class="{{ foo }} {{ bar || 'default' }}">
      //
      // This will update attribute:
      //
      //    view.update({foo});
      //

      figure.spot(variables).add(
        sourceNode(node.loc, ['      ', attr(node.loc, parent.reference, node.name, compile(expr))])
      );

      if (defaults.length > 0) {
        figure.construct(sourceNode(node.loc, [
          attr(node.loc, parent.reference, node.name, join(defaults, ' + '))
        ]));
      }
    }

  },

  /**
   * Generate code for spread operator.
   *
   *    <div {{...attributes}}>
   *
   * @param {ElementNode} parent
   * @param {AttributeNode} node
   * @param {Figure} figure
   */
  SpreadAttribute: ({parent, node, figure}) => {
    figure.root.addFunction('__spread', sourceNode([
      `function (node, attr) {\n`,
      `  for (var property in attr) if (attr.hasOwnProperty(property)) {\n`,
      `    if (property in ${esc(arrayToObject(plainAttributes))}) {\n`,
      `      node[property] = attr[property];\n`,
      `    } else {\n`,
      `      node.setAttribute(property, attr[property]);\n`,
      `    }\n`,
      `  }\n`,
      `}`
    ]));

    let attr = node.identifier.name;
    figure.addUpdater(node.loc, [attr], () =>
      sourceNode(node.loc, [`      __spread(${parent.reference}, ${attr})`])
    );
  }
}

/**
 * Transform attribute with text and expression into single expression.
 *
 *    <div class="cat {{ dog }} {{ cow || 'moo' }}">
 *
 * Will transformed into:
 *
 *    <div class={{ 'cat ' + dog + ' ' + (cow || 'moo') }}>
 *
 * Also collects default values for attribute: `cat ` and variables name with default: ['moo'].
 *
 * @param {Object} node
 * @param {Function} compile
 * @returns {*[]}
 */
function compileToExpression(node, compile) {
  let expr, defaults = [];

  let pushDefaults = (node) => {
    if (node.type == 'Literal') {
      defaults.push(compile(node));
    } else if (node.type == 'ExpressionStatement' && node.expression.type == 'LogicalExpression' && node.expression.operator == '||') {
      // Add as default right side of "||" expression if there are no variables.
      // In this example, when Monkberry will render div,
      //
      //    <div class="{{ foo || 'default' }}">
      //
      // it set class attribute fo 'default'.

      if (collectVariables(node.expression.right) == 0) {
        defaults.push(compile(node.expression.right));
      }
    }
  };

  if (!node.body) {
    expr = null;
  } else if (node.body.length == 1) {

    expr = extract(node.body[0]);
    pushDefaults(node.body[0]);

  } else if (node.body.length >= 2) {

    expr = new ast.BinaryExpressionNode('+', extract(node.body[0]), extract(node.body[1]), node.loc);
    pushDefaults(node.body[0]);
    pushDefaults(node.body[1]);

    let at = expr;
    for (var i = 2; i < node.body.length; i++) {
      at = at.right = new ast.BinaryExpressionNode('+', at.right, extract(node.body[i]), null);
      pushDefaults(node.body[i]);
    }
  }

  return [expr, defaults];
}


/**
 * Generate source nodes for attribute.
 * @param {Object} loc
 * @param {string} reference
 * @param {string} attrName
 * @param {string} value
 * @returns {SourceNode}
 */
function attr(loc, reference, attrName, value) {
  if (plainAttributes.indexOf(attrName) != -1) {
    return sourceNode(loc, [reference, '.', attrName, ' = ', value]);
  } else {
    return sourceNode(loc, [reference, '.setAttribute(', esc(attrName), ', ', value, ')']);
  }
}


/**
 * Returns default value for attribute name.
 * @param {string} attrName
 * @returns {string}
 */
function defaultAttrValue(attrName) {
  if (booleanAttributes.indexOf(attrName) != -1) {
    return 'true';
  } else {
    return '""';
  }
}


/**
 * @param {Object} node
 * @returns {Object}
 */
function extract(node) {
  if (node.type == 'ExpressionStatement') {
    return node.expression;
  } else {
    return node;
  }
}
