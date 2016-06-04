import { sourceNode } from './sourceNode';
import { esc } from '../utils';

export default {
  Text: ({node}) => {
    // Trim new lines and white spaces to a single whitespace.
    return sourceNode(node.loc, [`document.createTextNode(${esc(node.text.replace(/^\s+|\s+$/g, ' '))})`]);
  }
};
