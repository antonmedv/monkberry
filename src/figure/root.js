import { sourceNode, join } from '../compiler/sourceNode';

export class Root {
  constructor() {
    this.functions = {};
  }

  compile() {
    // Compile functions.
    if (Object.keys(this.functions).length > 0) {
      var defn = [];
      Object.keys(this.functions).forEach((key) => {
        defn.push(sourceNode(null, `${key} = ${this.functions[key]}`));
      });
      return sourceNode(null, 'var ').add(join(defn, ',\n')).add(';\n');
    } else {
      return sourceNode(null, '');
    }
  }

  addFunction(name, source) {
    if (!(name in this.functions)) {
      this.functions[name] = source;
    }
  }
}

