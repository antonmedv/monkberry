import { sourceNode } from './sourceNode';

export default {
  /**
   * @return {null}
   */
  ImportStatement: ({node, figure}) => {
    figure.root().addImport(sourceNode(node.loc, `require(${node.path.value});`));
    return null;
  }
};
