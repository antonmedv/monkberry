import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { collectVariables } from './expression/variable';
import { isSingleChild, notNull } from '../utils';

export default {
  IfStatement: ({parent, node, figure, compile}) => {
    node.reference = null;

    let templateNameForThen = figure.name + '_if' + figure.uniqid('template_name');
    let templateNameForOtherwise = figure.name + '_else' + figure.uniqid('template_name');
    let childNameForThen = 'child' + figure.uniqid('child_name');
    let childNameForOtherwise = 'child' + figure.uniqid('child_name');
    let placeholder;

    if (isSingleChild(parent, node)) {
      placeholder = parent.reference;
    } else {
      node.reference = placeholder = 'for' + figure.uniqid('placeholder');
      figure.declare(sourceNode(`var ${placeholder} = document.createComment('if');`));
    }


    figure.declare(`var ${childNameForThen} = {};`);

    if (node.otherwise) {
      figure.declare(`var ${childNameForOtherwise} = {};`);
    }

    // if (

    var variablesOfExpression = collectVariables(node.cond);

    figure.spot(variablesOfExpression).add(
      sourceNode(node.loc, [
        `      `,
        node.otherwise ? `result = ` : ``,
        `Monkberry.insert(_this, ${placeholder}, ${childNameForThen}, ${templateNameForThen}, __data__, `, compile(node.cond), `)`
      ])
    );

    if (node.otherwise) {
      figure.spot(variablesOfExpression).add(
        sourceNode(node.loc, [
          `      `,
          `Monkberry.insert(_this, ${placeholder}, ${childNameForOtherwise}, ${templateNameForOtherwise}, __data__, !result)`
        ])
      ).declareVariable('result');
    }

    // ) then {

    let compileBody = (loc, body, templateName, childName) => {
      let subfigure = new Figure(templateName, figure);
      subfigure.children = body.map(node => compile(node, subfigure)).filter(notNull);
      figure.addFigure(subfigure);

      let variablesOfBody = collectVariables(body);

      // Delete variables from expression to prevent double updating.
      variablesOfBody = variablesOfBody.filter((v) => variablesOfExpression.indexOf(v) == -1);

      variablesOfBody.forEach((variable) => {
        figure.spot(variable).add(
          sourceNode(loc, [
          `      `,
          // TODO: Properly collect local variables in templates and delete `hasOwnProperty` check in `if` refs.
          `${childName}.ref && ${childName}.ref.__update__.hasOwnProperty('${variable}') && ${childName}.ref.__update__.${variable}(__data__, ${variable})`
        ]));
      });
    };

    compileBody(node.loc, node.then, templateNameForThen, childNameForThen);

    // } else {

    if (node.otherwise) {
      compileBody(node.loc, node.otherwise, templateNameForOtherwise, childNameForOtherwise);
    }

    // }

    return node.reference;
  }
};


function compileBody(figure, loc, templateName, childName, body, variablesOfExpression) {
  figure.subFigures.push(figure.createFigure(templateName, body));

  var variablesOfBody = collectVariables(body);

  // Delete variables from expression to prevent double updating.
  variablesOfBody = variablesOfBody.filter((v) => variablesOfExpression.indexOf(v) == -1);

  variablesOfBody.forEach((variable) => {
    figure.onUpdater(variable).add(sourceNode(loc, [
      `      `,
      // TODO: Properly collect local variables in templates and delete `hasOwnProperty` check in `if` refs.
      `${childName}.ref && ${childName}.ref.__update__.hasOwnProperty('${variable}') && ${childName}.ref.__update__.${variable}(__data__, ${variable})`
    ]));
  });
}