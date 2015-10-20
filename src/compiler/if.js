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
      figure.declarations.push(sourceNode(this.loc, [placeholder, " = document.createComment('if')"]));
    }

    figure.declarations.push(sourceNode(this.loc, [childName, " = {}"]));

    // if (

    var variables = collectVariables(this.test);
    figure.addUpdater(this.loc, variables, () => {
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

      variables = collectVariables(this.then);
      variables.forEach((variable) => {
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
