import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { isSingleChild, esc, notNull } from '../utils';
import { Figure } from '../figure';

export default {
  ForStatement: ({parent, node, figure, compile}) => {
    node.reference = null;

    let templateName = figure.name + '.for' + figure.uniqid('template_name');
    let childrenName = 'children' + figure.uniqid('child_name');
    let placeholder;

    if (isSingleChild(parent, node)) {
      placeholder = parent.reference;
    } else {
      node.reference = placeholder = 'for' + figure.uniqid('placeholder');
      figure.declare(sourceNode(`var ${placeholder} = document.createComment('for');`));
    }

    figure.declare(sourceNode(`var ${childrenName} = monkberry.map();`));

    // for (

    let variablesOfExpression = collectVariables(node.expr);

    figure.spot(variablesOfExpression).add(
      sourceNode(node.loc, [
        `Monkberry.loop(this, ${placeholder}, ${childrenName}, ${templateName}, __data__`,
        compile(node.expr),
        (node.options === null ? `` : [`, `, esc(node.options)]),
        `)`
      ])
    );


    // ) {

    if (node.body.length > 0) {
      let subFigure = new Figure(templateName, figure);
      subFigure.children = node.body.map((node) => compile(node, figure)).filter(notNull);

      figure.addFigure(subFigure);
    }

    if (node.options !== null) {
      let variablesOfBody = collectVariables(node.body);

      // Remove options variables.
      for (var i = variablesOfBody.length - 1; i >= 0; i--) {
        if (variablesOfBody[i] == node.options.value || variablesOfBody[i] == node.options.key) {
          variablesOfBody.splice(i, 1);
        }
      }

      // TODO: Properly collect local variables in templates and delete `hasOwnProperty` check in `forEach`.

      // Delete variables from expression to prevent double updating.
      variablesOfBody = variablesOfBody.filter((v) => variablesOfExpression.indexOf(v) == -1);

      // Add to updaters.
      variablesOfBody.forEach((variable) => {
        figure.spot(variable).add(
          sourceNode(node.loc, [
            "      ", childrenName, ".forEach(function (view) {\n",
            "        if (view.__update__.hasOwnProperty('", variable, "')) view.__update__.", variable, "(__data__, ", variable, ");\n",
            "      })"
          ])
        );
      });
    }

    // }

    return node.reference;
  }
};
