import { sourceNode } from './sourceNode';
import { indent, indentFromSecondLine, size } from '../utils';

export default function (ast) {
  ast.DocumentNode.prototype.compile = function (figure) {
    var children = this.body.map((node) => node.compile(figure));

    var sn = sourceNode(this.loc, 'function () {\n');

    if (figure.declarations.length > 0) {
      sn.add('  // Create elements\n');
      sn.add(['  var ', indentFromSecondLine(figure.declarations.join(',\n'), 4), ';\n']);
      sn.add('\n');
    }

    if (figure.construct.length > 0) {
      sn.add('  // Construct dom\n');
      sn.add([indent(figure.construct.join('\n'), 2), '\n']);
      sn.add('\n');
    }

    sn.add('  // Create view\n');
    sn.add('  var view = monkberry.view();\n');
    sn.add('\n');

    if (size(figure.complexSetters) > 0) {
      sn.add('  // Complex setters functions\n');
      sn.add('  var __cache__ = view.cache = {};\n');
      sn.add('  var λ = {\n');
      sn.add([indent(figure.compileComplexSetters(), 4), '\n']);
      sn.add('  };\n');
      sn.add('\n');
    }

    if (size(figure.setters) > 0) {
      sn.add('  // Setters functions\n');
      sn.add('  view.set = {\n');
      sn.add([indent(figure.compileSetters(), 4), '\n']);
      sn.add('  };\n');
      sn.add('\n');
    }

    if (figure.updateActions.length > 0) {
      sn.add('  // Extra update function\n');
      sn.add('  view._update = function (__data__) {\n');
      sn.add([indent(figure.compileUpdateActions(), 4), '\n']);
      sn.add('  };\n');
      sn.add('\n');
    }

    sn.add('  // Set root nodes\n');
    sn.add(['  view.nodes = [', children.join(', '), '];\n']);
    sn.add('  return view;\n');

    sn.add('}');

    return sn;
  };
}


