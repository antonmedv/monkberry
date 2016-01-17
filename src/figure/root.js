import { sourceNode, join } from '../compiler/sourceNode';

export class Root {
  constructor() {
    this.imports = {};
    this.functions = {};
  }

  compile() {
    var sn = sourceNode(null, '');

    // Compile imports.
    Object.keys(this.imports).forEach((path) => {
      let loc = this.imports[path];
      sn.add(sourceNode(loc, `monkberry.mount(require(${path}));\n`));
    });

    // Compile functions.
    if (Object.keys(this.functions).length > 0) {
      var defn = [];
      Object.keys(this.functions).forEach((key) => {
        defn.push(sourceNode(null, `${key} = ${this.functions[key]}`));
      });
      sn.add(sourceNode(null, 'var ').add(join(defn, ',\n')).add(';\n'));
    }

    return sn;
  }

  addImport(loc, path) {
    if (!(path in this.imports)) {
      this.imports[path] = loc;
    }
  }

  addFunction(name, source) {
    if (!(name in this.functions)) {
      this.functions[name] = source;
    }
  }
}

