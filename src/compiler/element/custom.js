import { sourceNode } from '../sourceNode';
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

    var defaultData = [];
    var hasUpdater = false;

    // Collect info about variables and attributes.
    for (let attr of this.attributes) {
      if (attr.type == 'SpreadAttribute') {

        figure.addUpdater(this.loc, [attr.identifier.name], () => {
          return sourceNode(this.loc, [
            `      monkberry.insert(view, ${placeholder}, ${childName}, '${templateName}', ${attr.identifier.name}, true)`
          ]);
        });
        hasUpdater = true;

      } else {
        // TODO: Add support for default value in attributes attr={{ value || 'default' }}.
        let [expr, ] = attr.compileToExpression();
        let variables = collectVariables(expr);

        let data = sourceNode(this.loc, [`'${attr.name}': ${ expr.compile()}`]);

        if (variables.length == 0) {
          defaultData.push(data);
        } else {

          figure.addUpdater(this.loc, variables, () => {
            return sourceNode(this.loc, [
              `      monkberry.insert(view, ${placeholder}, ${childName}, '${templateName}', {${data}}, true)`
            ]);
          });
          hasUpdater = true;

        }
      }
    }

    if (!hasUpdater || defaultData.length > 0) {
      let data = '{}';

      if(defaultData.length > 0) {
        data = `{${defaultData.join(', ')}}`;
      }

      figure.renderActions.push(sourceNode(this.loc, [
        `      monkberry.insert(view, ${placeholder}, ${childName}, '${templateName}', ${data}, true);`
      ]));
    }

    if (this.body.length > 0) {
      figure.subFigures.push(figure.createFigure(templateName, this.body));
    }

    return parentNode ? null : placeholder;
  };
}
