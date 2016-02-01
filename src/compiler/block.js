import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, getStringLiteralValue, map, esc } from '../utils';

export default function (ast) {
  ast.BlockStatementNode.prototype.compile = function (figure) {
    let blockName = getStringLiteralValue(this.name);
    let template = blockName;
    let child = 'child' + figure.uniqid('child_name');

    let placeholder, parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'block' + figure.uniqid('placeholder');
      figure.declarations.push(sourceNode(null, `var ${placeholder} = document.createComment('block');`));
    }

    figure.declarations.push(sourceNode(null, `var ${child} = {}; // Block "${blockName}".`));

    // Insert into parent on render
    figure.renderActions.push(sourceNode(this.loc, [
      `      monkberry.insert(view, ${placeholder}, ${child}, '${template}', {}, true);`
    ]));

    if (this.body.length > 0) {
      figure.subFigures.push(figure.createFigure(template, this.body));
      var variablesOfBody = collectVariables(this.body);

      variablesOfBody.forEach((variable) => figure.onUpdater(variable).add(sourceNode(this.loc,
        `      ${child}.ref && ${child}.ref.__update__.${variable}(__data__, ${variable})`
      )));

    }

    return parentNode ? null : placeholder;
  };
}
