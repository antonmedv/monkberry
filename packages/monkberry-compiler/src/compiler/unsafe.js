const { sourceNode } =require( './sourceNode')
const { collectVariables } =require( './variable')
const { isSingleChild } =require( '../utils')

module.exports = {
  UnsafeStatement: ({parent, node, figure, compile}) => {
    node.reference = null;

    let unsafeNumber = figure.uniqid('unsafe');
    let unsafeNodes = 'unsafeNodes' + unsafeNumber;
    let placeholder;

    if (isSingleChild(parent, node)) {
      placeholder = parent.reference;
    } else {
      node.reference = placeholder = 'unsafe' + unsafeNumber;
      figure.declare(sourceNode(`var ${placeholder} = document.createComment('unsafe');`));
    }


    figure.declare(sourceNode(`var ${unsafeNodes} = [];`));

    // Add unsafe function.
    let code = unsafe.toString().replace(/(\s{2,}|\n)/g, '');
    figure.root().addFunction('__unsafe', sourceNode(null, code));

    let variables = collectVariables(figure.getScope(), node.html);

    if (variables.length == 0) {
      figure.addRenderActions(
        sourceNode(node.loc, [
          `      __unsafe(${placeholder}, ${unsafeNodes}, `, compile(node.html), `);`
        ])
      );
    } else {
      figure.spot(variables).add(
        sourceNode(node.loc, [
          `      __unsafe(${placeholder}, ${unsafeNodes}, `, compile(node.html), `)`
        ])
      );
    }

    return node.reference;
  }
};

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
