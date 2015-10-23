import { sourceNode } from '../sourceNode';
import { createFigure } from '../../figure';
import { collectVariables } from '../expression/variable';
import { lookUpOnlyOneChild, map, unique } from '../../utils';

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
      figure.declare(["var ", placeholder, " = document.createComment('" + customNodeName + "');"]);
    }
    figure.declare(["var ", childName, " = {};"]);

    var customData = [];

    var variables = [];
    for (var attr of this.attributes) {
      var [expr, ] = attr.compileToExpression();
      variables = variables.concat(collectVariables(expr));

      customData.push(sourceNode(this.loc, ["'", attr.name, "': ", expr.compile()]));
    }
    variables = unique(variables);

    if (variables.length == 0) {

      figure.renderActions.push(sourceNode(this.loc, ["      ",
        "monkberry.insert(view, ",
        placeholder, ", ",
        childName, ", ",
        `'${templateName}', `,
        "{", customData.join(', '), "}, ",
        "true",
        ");"
      ]));

    } else {

      figure.addUpdater(this.loc, variables, () => {
        return sourceNode(this.loc, ["      ",
          "monkberry.insert(view, ",
          placeholder, ", ",
          childName, ", ",
          `'${templateName}', `,
          "{", customData.join(', '), "}, ",
          "true",
          ")"
        ]);
      });

    }

    if (this.body.length > 0) {
      figure.subFigures.push(createFigure(templateName, this.body));
    }

    return parentNode ? null : placeholder;
  };
}
