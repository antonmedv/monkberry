import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, map } from '../utils';

export default function (ast) {
  ast.IfStatementNode.prototype.compile = function (figure) {
    var templateNameForThen = figure.name + '.if' + figure.uniqid('template_name');
    var templateNameForElse = templateNameForThen + '.else';
    // TODO: Optimize when child has only one custom node. Replace templateName with that custom tag name.

    var childNameForThen = 'child' + figure.uniqid('child_name');
    var childNameForElse = 'child' + figure.uniqid('child_name');

    var placeholder;
    var parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'if' + figure.uniqid('placeholder');
      figure.declare(["var ", placeholder, " = document.createComment('if');"]);
    }

    figure.declare(["var ", childNameForThen, " = {};"]);

    if (this._else) {
      figure.declare(["var ", childNameForElse, " = {};"]);
    }

    // if (

    var variablesOfExpression = collectVariables(this.test);

    compileTest(figure, this.loc, this._else ? "result = " : "", placeholder, templateNameForThen, childNameForThen, this.test.compile(), variablesOfExpression).declareVariable(this._else ? "result" : false);

    if (this._else) {
      compileTest(figure, this.loc, "", placeholder, templateNameForElse, childNameForElse, "!result", variablesOfExpression);
    }

    // ) then {

    compileBody(figure, this.loc, templateNameForThen, childNameForThen, this.then, variablesOfExpression);

    // } else {

    if (this._else) {
      compileBody(figure, this.loc, templateNameForElse, childNameForElse, this._else, variablesOfExpression);
    }

    // }

    return parentNode ? null : placeholder;
  };
}

function compileTest(figure, loc, prepend, placeholder, templateName, childName, result, variablesOfExpression) {
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