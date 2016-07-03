import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { collectVariables } from './variable';
import { isSingleChild, notNull } from '../utils';

export default {
  IfStatement: ({parent, node, figure, compile, options}) => {
    node.reference = null;

    let templateNameForThen = figure.name + '_if' + figure.uniqid('template_name');
    let templateNameForOtherwise = figure.name + '_else' + figure.uniqid('template_name');
    let childNameForThen = 'child' + figure.uniqid('child_name');
    let childNameForOtherwise = 'child' + figure.uniqid('child_name');
    let placeholder;

    const _var = options.ecmaVersion < 6 ? 'var' : 'const';

    if (isSingleChild(parent, node)) {
      placeholder = parent.reference;
    } else {
      node.reference = placeholder = 'for' + figure.uniqid('placeholder');
      figure.declare(sourceNode(`${_var} ${placeholder} = document.createComment('if');`));
    }


    figure.declare(`${_var} ${childNameForThen} = {};`);

    if (node.otherwise) {
      figure.declare(`${_var} ${childNameForOtherwise} = {};`);
    }

    // if (

    var variablesOfExpression = collectVariables(figure.getScope(), node.cond);

    figure.thisRef = true;
    figure.hasNested = true;

    figure.spot(variablesOfExpression).add(
      sourceNode(node.loc, [
        `      `,
        node.otherwise ? `result = ` : ``,
        `Monkberry.cond(_this, ${placeholder}, ${childNameForThen}, ${templateNameForThen}, `, compile(node.cond), `)`
      ])
    );

    if (node.otherwise) {
      figure.spot(variablesOfExpression).add(
        sourceNode(node.loc, [
          `      `,
          `Monkberry.cond(_this, ${placeholder}, ${childNameForOtherwise}, ${templateNameForOtherwise}, !result)`
        ])
      ).declareVariable('result');
    }

    // ) then {

    let compileBody = (loc, body, templateName, childName) => {
      let subfigure = new Figure(templateName, figure, options);
      subfigure.children = body.map(node => compile(node, subfigure)).filter(notNull);
      figure.addFigure(subfigure);

      figure.addOnUpdate(
        sourceNode(loc, [
          `    if (${childName}.ref) {\n`,
          `      ${childName}.ref.update(__data__);\n`,
          `    }`
        ])
      );
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
