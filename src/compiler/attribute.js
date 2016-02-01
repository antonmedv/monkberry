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
 * @type {string[]}
 */
const plainAttributes = ['id', 'value', 'checked', 'selected'];

/**
 * This attributes take boolean values, not string values.
 * @type {string[]}
 */
const booleanAttributes = ['checked', 'selected'];

export default function (ast) {
  ast.AttributeNode.prototype.compile = function (figure, nodeName) {
    // Transform attribute with text and expression into single expression.
    //
    //    <div class="cat {{ dog }} {{ cow }}">
    //
    // Will transformed into:
    //
    //    <div class={{ 'cat ' + dog + ' ' + cow }}>
    //
    // Also collects default values for attribute: `cat `.
    let [expr, defaults] = this.compileToExpression();

    var variables = collectVariables(expr);

    if (variables.length == 0) {
      figure.construct.push(sourceNode(this.loc, [
        attr(this.loc, nodeName, this.name, (expr ? expr.compile() : defaultAttrValue(this.name))), ';'
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
      // On other side, if one of expression contains default value,
      // Monkberry will set attribute for every variable:
      //
      //    <div class="{{ foo }} {{ bar || 'default' }}">
      //
      // This will update attribute:
      //
      //    view.update({foo});
      //

      // TODO: Implement other side.

      figure.addUpdater(this.loc, variables, () => sourceNode(this.loc, [
        '      ', attr(this.loc, nodeName, this.name, expr.compile())
      ]));

      if (defaults.length > 0) {
        figure.construct.push(sourceNode(this.loc, [
          attr(this.loc, nodeName, this.name, join(defaults, ' + ')), ';'
        ]));
      }
    }

  };

  /**
   * Generate code for spread operator.
   *
   *    <div {{...attributes}}>
   *
   * @param {Figure} figure
   * @param {string} nodeName
   */
  ast.SpreadAttributeNode.prototype.compile = function (figure, nodeName) {
    figure.root.addFunction('__spread', sourceNode(null, [
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

    let attr = this.identifier.name;
    figure.addUpdater(this.loc, [attr], () =>
      sourceNode(this.loc, [`      __spread(${nodeName}, ${attr})`])
    );
  };

  function attr(loc, nodeName, attrName, value) {
    if (plainAttributes.indexOf(attrName) != -1) {
      return sourceNode(loc, [nodeName, '.', attrName, ' = ', value]);
    } else {
      return sourceNode(loc, [nodeName, '.setAttribute(', esc(attrName), ', ', value, ')']);
    }
  }

  function defaultAttrValue(attrName) {
    if (booleanAttributes.indexOf(attrName) != -1) {
      return 'true';
    } else {
      return '""';
    }
  }

  ast.AttributeNode.prototype.compileToExpression = function () {
    var expr, defaults = [];

    var pushDefaults = (node) => {
      if (node.type == 'Literal') {
        defaults.push(node.compile());
      } else if (node.type == 'ExpressionStatement' && node.expression.type == 'LogicalExpression' && node.expression.operator == '||') {
        // Add as default right side of "||" expression if there are no variables.
        // In this example, when Monkberry will render div,
        //
        //    <div class="{{ foo || 'default' }}">
        //
        // it set class attribute fo 'default'.

        if (collectVariables(node.expression.right) == 0) {
          defaults.push(node.expression.right.compile());

          // TODO: Implement other side.
        }
      }
    };

    if (!this.body) {
      expr = null;
    } else if (this.body.length == 1) {

      expr = extract(this.body[0]);
      pushDefaults(this.body[0]);

    } else if (this.body.length >= 2) {

      expr = new ast.BinaryExpressionNode('+', extract(this.body[0]), extract(this.body[1]), this.loc);
      pushDefaults(this.body[0]);
      pushDefaults(this.body[1]);

      var at = expr;
      for (var i = 2; i < this.body.length; i++) {
        at = at.right = new ast.BinaryExpressionNode('+', at.right, extract(this.body[i]), null);
        pushDefaults(this.body[i]);
      }
    }

    return [expr, defaults];
  };

  function extract(node) {
    if (node.type == 'ExpressionStatement') {
      return node.expression;
    } else {
      return node;
    }
  }
}
