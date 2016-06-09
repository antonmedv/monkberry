import { sourceNode } from './sourceNode';
import { collectVariables } from './variable';
import { isSingleChild, esc, notNull } from '../utils';
import { Figure } from '../figure';

export default {
  ForStatement: ({parent, node, figure, compile}) => {
    node.reference = null;

    let templateName = figure.name + '_for' + figure.uniqid('template_name');
    let childrenName = 'children' + figure.uniqid('child_name');
    let placeholder;

    if (isSingleChild(parent, node)) {
      placeholder = parent.reference;
    } else {
      node.reference = placeholder = 'for' + figure.uniqid('placeholder');
      figure.declare(sourceNode(`var ${placeholder} = document.createComment('for');`));
    }

    figure.declare(sourceNode(`var ${childrenName} = new Monkberry.Map();`));

    // for (

    let variablesOfExpression = collectVariables(figure.getScope(), node.expr);

    figure.thisRef = true;
    figure.spot(variablesOfExpression).add(
      sourceNode(node.loc, [
        `      Monkberry.loop(_this, ${placeholder}, ${childrenName}, ${templateName}, `,
        compile(node.expr),
        (node.options === null ? `` : [`, `, esc(node.options)]),
        `)`
      ])
    );


    // ) {

    let subfigure = new Figure(templateName, figure);

    if (node.body.length > 0) {
      subfigure.children = node.body.map((node) => compile(node, subfigure)).filter(notNull);
      figure.addFigure(subfigure);
    }

    if (node.options !== null) {
      figure.addOnUpdate(
        sourceNode(node.loc, [
          `    ${childrenName}.forEach(function (view) {\n`,
          `      view.update(__data__);\n`,
          `    });`
        ])
      );

      [node.options.value, node.options.key].forEach(variable => {
        if (subfigure.hasSpot(variable)) {
          subfigure.spot(variable).onlyFromLoop = true;
        }
      });

    }

    // }

    return node.reference;
  }
};
