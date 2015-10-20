import { sourceNode } from './sourceNode';
import { createFigure } from '../figure';
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
      figure.declarations.push(sourceNode(this.loc, [placeholder, " = document.createComment('for')"]));
    }

    figure.declarations.push(sourceNode(this.loc, [childrenName, " = monkberry.map()"]));

    // for (

    var variables = collectVariables(this.expr);
    figure.addUpdater(this.loc, variables, () => {
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
      figure.subFigures.push(createFigure(templateName, this.body));
    }

    if (this.options !== null) {
      variables = collectVariables(this.body);

      // Remove options variables.
      for(var i = variables.length - 1; i >= 0; i--) {
        if(variables[i] == this.options.value || variables[i] == this.options.key) {
          variables.splice(i, 1);
        }
      }

      // Add to updaters.
      variables.forEach((variable) => {
        figure.onUpdater(variable).add(sourceNode(this.loc, [
          "      ", childrenName, ".forEach(function (view) {\n",
          "        view.__update__.", variable, "(__data__, ", variable, ");\n",
          "      })"
        ]));
      });
    }

    // }

    return parentNode ? null : placeholder;
  };
}
