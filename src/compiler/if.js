import { sourceNode } from './sourceNode';
import { createFigure } from '../figure';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, map } from '../utils';

export default function (ast) {
  ast.IfStatementNode.prototype.compile = function (figure) {
    var templateName = figure.name + '.if' + figure.uniqid('template_name');
    // TODO: Optimize when child has only one custom node. Replace templateName with that custom tag name.

    var childName = 'child' + figure.uniqid('child_name');

    var placeholder;
    var parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'if' + figure.uniqid('placeholder');
      figure.declarations.push(sourceNode(null, ["var ", placeholder, " = document.createComment('if');"]));
    }

    figure.declarations.push(sourceNode(null, ["var ", childName, " = {};"]));

    // if (

    var variablesOfExpression = collectVariables(this.test);
    figure.addUpdater(this.loc, variablesOfExpression, () => {
      return sourceNode(this.loc, [
        "      ",
        "monkberry.insert(view, ",
        placeholder, ", ",
        childName, ", ",
        `'${templateName}', `,
        "__data__, ",
        this.test.compile(),
        ")"
      ]);
    });

    // ) then {

    if (this.then.length > 0) {
      figure.subFigures.push(createFigure(templateName, this.then));

      var variablesOfBody = collectVariables(this.then);

      // Delete variables from expression to prevent double updating.
      variablesOfBody = variablesOfBody.filter((v) => variablesOfExpression.indexOf(v) == -1);

      variablesOfBody.forEach((variable) => {
        figure.onUpdater(variable).add(sourceNode(this.loc, [
          "      ",
          childName, ".ref && ",
          childName, ".ref.__update__.", variable, "(__data__, ", variable, ")"
        ]));
      });
    }

    // } else {
    // TODO: Implement else part.
    // }

    return parentNode ? null : placeholder;
  };
}
