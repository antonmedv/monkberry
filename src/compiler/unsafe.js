import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, esc } from '../utils';

export default function (ast) {
  ast.UnsafeStatementNode.prototype.compile = function (figure) {
    let unsafeNumber = figure.uniqid('unsafe');

    let placeholder;
    let parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'unsafe' + unsafeNumber;
      figure.declare([`var ${placeholder} = document.createComment('unsafe');`]);
    }

    let unsafeNodes = 'unsafeNodes' + unsafeNumber;
    figure.declare([`var ${unsafeNodes} = [];`]);

    // Add unsafe function.
    let code = unsafe.toString().replace(/(\s{2,}|\n)/g, '');
    figure.root.addFunction('__unsafe', sourceNode(null, code));

    let variables = collectVariables(this.html);

    if (variables.length == 0) {
      figure.renderActions.push(sourceNode(this.loc, [
        `      __unsafe(${placeholder}, ${unsafeNodes}, `, this.html.compile(), `);`
      ]));
    } else {
      figure.addUpdater(this.loc, variables, () => sourceNode(this.loc, [
        `      __unsafe(${placeholder}, ${unsafeNodes}, `, this.html.compile(), `)`
      ]));
    }

    return parentNode ? null : placeholder;
  };
}

/**
 * This function is being used for unsafe `innerHTML` insertion of HTML into DOM.
 * Code looks strange. I know. But it is possible minimalistic implementation of.
 *
 * @param root {Element} Node there to insert unsafe html.
 * @param nodes {Array} List of already inserted html nodes for remove.
 * @param html {string} Unsafe html to insert.
 */
function unsafe(root, nodes, html) {
  var node, j, i = nodes.length, element = document.createElement('div');
  element.innerHTML = html;

  while (i --> 0)
    nodes[i].parentNode.removeChild(nodes.pop());

  for (i = j = element.childNodes.length - 1; j >= 0; j--)
    nodes.push(element.childNodes[j]);

  ++i;
  if (root.nodeType == 8)
    if (root.parentNode)
      while (i --> 0)
        root.parentNode.insertBefore(nodes[i], root);

    else
      throw "Can not insert child view into parent node. You need append your view first and then update.";

  else
    while (i --> 0)
      root.appendChild(nodes[i]);
}
