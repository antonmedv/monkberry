import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, map, esc } from '../utils';

export default function (ast) {
  ast.ForStatementNode.prototype.compile = function (figure) {
    var templateName = figure.name + '.for' + figure.uniqid('template_name');
    // TODO: Optimize when child has only one custom node. Replace templateName with that custom tag name.

    var childrenName = 'children' + figure.uniqid('child_name');

    var placeholder;
    var parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'for' + figure.uniqid('placeholder');
      figure.declarations.push(sourceNode(null, ["var ", placeholder, " = document.createComment('for');"]));
    }

    figure.declarations.push(sourceNode(null, ["var ", childrenName, " = monkberry.map();"]));

    // for (

    var variablesOfExpression = collectVariables(this.expr);
    figure.addUpdater(this.loc, variablesOfExpression, () => {
      return sourceNode(this.loc, [
        "      ",
        "monkberry.foreach(view, ",
        placeholder, ", ",
        childrenName, ", ",
        `'${templateName}', `,
        "__data__, ",
        this.expr.compile(),
        (this.options === null ? "" : [
          ", ", esc(this.options)
        ]),
        ")"
      ]);
    });

    // ) {

    if (this.body.length > 0) {
      figure.subFigures.push(figure.createFigure(templateName, this.body));
    }

    if (this.options !== null) {
      var variablesOfBody = collectVariables(this.body);

      // Remove options variables.
      for(var i = variablesOfBody.length - 1; i >= 0; i--) {
        if(variablesOfBody[i] == this.options.value || variablesOfBody[i] == this.options.key) {
          variablesOfBody.splice(i, 1);
        }
      }

      // TODO: Properly collect local variables in templates and delete `hasOwnProperty` check in `forEach`.

      // Delete variables from expression to prevent double updating.
      variablesOfBody = variablesOfBody.filter((v) => variablesOfExpression.indexOf(v) == -1);

      // Add to updaters.
      variablesOfBody.forEach((variable) => {
        figure.onUpdater(variable).add(sourceNode(this.loc, [
          "      ", childrenName, ".forEach(function (view) {\n",
          "        if (view.__update__.hasOwnProperty('", variable, "')) view.__update__.", variable, "(__data__, ", variable, ");\n",
          "      })"
        ]));
      });
    }

    // }

    return parentNode ? null : placeholder;
  };
}
