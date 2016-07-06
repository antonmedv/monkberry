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

      // Add to child(!) figure extra cache methods,
      // for saving data from loop options for render.
      [node.options.value, node.options.key].forEach(variable => {
        subfigure.thisRef = true;
        subfigure.prependOnUpdate(sourceNode([
          `    if (_this.__cache__.${variable}) {\n`,
          `      __data__.${variable} = _this.__cache__.${variable};\n`,
          `    }`
        ]));

        // Cache all options data.
        subfigure.spot(variable).onlyFromLoop = true;
        subfigure.spot(variable).cache = true;
      });

    }

    // }

    return node.reference;
  }
};
