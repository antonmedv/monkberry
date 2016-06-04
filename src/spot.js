import { unique } from './utils';
import { sourceNode } from './compiler/sourceNode';

export class Spot {
  constructor(variables) {
    this.variables = unique(variables).sort();
    this.reference = this.variables.join('_');
    this.operators = [];
  }

  generate() {
    let sn = sourceNode(
      `function (__data__, ${this.variables.join(`, `)}) {\n`
    );

    if (this.operators.length > 0) {
      sn.add(sourceNode(this.operators).join(';\n')).add(';\n');
    }

    sn.add('    }');

    return sn;
  }

  add(code) {
    this.operators.push(code);
    return this;
  }
}
