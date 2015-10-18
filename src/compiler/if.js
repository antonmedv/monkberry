import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, map } from '../utils';

export default function (ast) {
  ast.IfStatementNode.prototype.compile = function (figure) {
    var templateName = figure.name + '.if' + figure.uniqid('template_name');
    // TODO: Optimize when child has only one custom node. Replace templateName with that custom tag name.

    var childrenName = 'child' + figure.uniqid('child_name');

    var placeholder;
    var parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'if' + figure.uniqid('placeholder');
      figure.declarations.push(sourceNode(this.loc, [placeholder, " = document.createComment('if')"]));
    }

    // if (

    var variables = collectVariables(this.test);
    figure.addUpdater(this.loc, variables, () => {
      return sourceNode(this.loc, [
        "      ",
        "monkberry.insert(view, ",
        placeholder, ", ",
        childrenName, ", ",
        `'${templateName}', `,
        "__data__, ",
        this.test.compile(),
        ")"
      ]);
    }, true);

    // ) then {

    if (this.then.length > 0) {
      var subFigure = new Figure(templateName);
      subFigure.children = map(this.then, (node) => node.compile(subFigure));

      figure.subFigures.push(subFigure);
    }

    // } else {
    // TODO: Implement else part.
    // }

    return parentNode ? null : placeholder;
  };
};
