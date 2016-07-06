import { sourceNode } from './sourceNode';

export default {
  /**
   * @return {null}
   */
  ImportStatement: ({node, figure, options}) => {
    // TODO: Add support for ES2015 imports.
    figure.root().addImport(
      sourceNode(
        node.loc,
        options.ecmaVersion < 6
          ? `var ${node.identifier.name} = require(${node.path.value}).default;`
          : `import ${node.identifier.name} from ${node.path.value};`
      )
    );

    figure.addToScope(node.identifier.name);

    return null;
  }
};
