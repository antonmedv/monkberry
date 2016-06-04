import { sourceNode } from './sourceNode';
import { collectVariables } from './expression/variable';
import { lookUpOnlyOneChild, map, unique } from '../utils';

export default {
  Element: (figure) => {
    const customNodeName = this.name;
    const templateName = customNodeName;
    const childName = 'child' + figure.uniqid('child_name');

    let placeholder;
    let parentNode = lookUpOnlyOneChild(this);
    if (parentNode) {
      placeholder = parentNode.nodeName;
    } else {
      placeholder = 'custom' + figure.uniqid('placeholder');
      figure.declare([`var ${placeholder} = document.createComment('${customNodeName}');`]);
    }
    figure.declare([`var ${childName} = {};`]);

    let data = [];
    let variables = [];

    // Collect info about variables and attributes.
    for (let attr of this.attributes) {
      if (attr.type == 'SpreadAttribute') {

        figure.addUpdater(this.loc, [attr.identifier.name], () => {
          return sourceNode(this.loc, [
            `      monkberry.insert(view, ${placeholder}, ${childName}, '${templateName}', ${attr.identifier.name}, true)`
          ]);
        });

      } else {

        let [expr, ] = attr.compileToExpression(); // TODO: Add support for default value in custom tag attributes attr={{ value || 'default' }}.
        variables = variables.concat(collectVariables(expr));

        let property = sourceNode(this.loc, [`'${attr.name}': ${ expr.compile()}`]);
        data.push(property);

      }
    }

    variables = unique(variables);
    data = `{${data.join(', ')}}`;

    // Add complex/caching updater for custom attribute or insert on render if no variables in attributes.
    if (variables.length > 0) {

      figure.addUpdater(this.loc, variables, () => {
        return sourceNode(this.loc, [
          `      monkberry.insert(view, ${placeholder}, ${childName}, '${templateName}', ${data}, true)`
        ]);
      });

    } else {

      figure.renderActions.push(sourceNode(this.loc, [
        `      monkberry.insert(view, ${placeholder}, ${childName}, '${templateName}', ${data}, true);`
      ]));

    }

    if (this.body.length > 0) {
      figure.subFigures.push(figure.createFigure(templateName, this.body));
    }

    return parentNode ? null : placeholder;
  }
};
