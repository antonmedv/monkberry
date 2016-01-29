import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, map } from '../utils';

export default function (ast) {
  ast.IfStatementNode.prototype.compile = function (figure) {
    let templateNameForThen, templateNameForOtherwise;

    if (this.templateNames && this.templateNames.then) {
      templateNameForThen = figure.name + '.' + this.templateNames.then;
    } else {
      templateNameForThen = figure.name + '.if' + figure.uniqid('template_name');
    }

    if (this.templateNames && this.templateNames.otherwise) {
      templateNameForOtherwise = figure.name + '.' + this.templateNames.otherwise;
    } else {
      templateNameForOtherwise = templateNameForThen + '.else';
    }

    let childNameForThen = 'child' + figure.uniqid('child_name');
    let childNameForOtherwise = 'child' + figure.uniqid('child_name');

    let placeholder, parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'if' + figure.uniqid('placeholder');
      figure.declare(["var ", placeholder, " = document.createComment('if');"]);
    }

    figure.declare(["var ", childNameForThen, " = {};"]);

    if (this.otherwise) {
      figure.declare(["var ", childNameForOtherwise, " = {};"]);
    }

    // if (

    var variablesOfExpression = collectVariables(this.cond);

    compileCond(figure, this.loc, this.otherwise ? "result = " : "", placeholder, templateNameForThen, childNameForThen, this.cond.compile(), variablesOfExpression).declareVariable(this.otherwise ? "result" : false);

    if (this.otherwise) {
      compileCond(figure, this.loc, "", placeholder, templateNameForOtherwise, childNameForOtherwise, "!result", variablesOfExpression);
    }

    // ) then {

    compileBody(figure, this.loc, templateNameForThen, childNameForThen, this.then, variablesOfExpression);

    // } else {

    if (this.otherwise) {
      compileBody(figure, this.loc, templateNameForOtherwise, childNameForOtherwise, this.otherwise, variablesOfExpression);
    }

    // }

    return parentNode ? null : placeholder;
  };
}

function compileCond(figure, loc, prepend, placeholder, templateName, childName, result, variablesOfExpression) {
  return figure.addUpdater(loc, variablesOfExpression, () => {
    return sourceNode(loc, ["      ",
      prepend,
      "monkberry.insert(view, ",
      placeholder, ", ",
      childName, ", ",
      `'${templateName}', `,
      "__data__, ",
      result,
      ")"
    ]);
  });
}

function compileBody(figure, loc, templateName, childName, body, variablesOfExpression) {
  figure.subFigures.push(figure.createFigure(templateName, body));

  var variablesOfBody = collectVariables(body);

  // Delete variables from expression to prevent double updating.
  variablesOfBody = variablesOfBody.filter((v) => variablesOfExpression.indexOf(v) == -1);

  variablesOfBody.forEach((variable) => {
    figure.onUpdater(variable).add(sourceNode(loc, [
      "      ",
      childName, ".ref && ",
      childName, ".ref.__update__.", variable, "(__data__, ", variable, ")"
    ]));
  });
}