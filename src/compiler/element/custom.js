import { sourceNode } from '../sourceNode';
import { createFigure } from '../../figure';
import { collectVariables } from '../expression/variable';
import { lookUpOnlyOneChild, map } from '../../utils';

export default function (ast) {
  ast.ElementNode.prototype.compileCustom = function (figure) {
    var customNodeName = this.name;
    var templateName = customNodeName;
    var childName = 'child' + figure.uniqid('child_name');

    var placeholder;
    var parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'custom' + figure.uniqid('placeholder');
      figure.declarations.push(sourceNode(this.loc, [placeholder, " = document.createComment('" + customNodeName + "')"]));
    }

    figure.declarations.push(sourceNode(this.loc, [childName, " = {}"]));
    figure.updateActions.push(sourceNode(this.loc, [
        "      ",
        "monkberry.insert(view, ",
        placeholder, ", ",
        childName, ", ",
        `'${templateName}', `,
        "__data__, ",
        "true",
        ")"
      ]));

    if (this.body.length > 0) {
      figure.subFigures.push(createFigure(templateName, this.body));
    }

    return parentNode ? null : placeholder;
  };
}
