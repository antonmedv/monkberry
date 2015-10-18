import { sourceNode } from './sourceNode';

export default function (ast) {
  ast.DocumentNode.prototype.compile = function (figure) {
    figure.children = this.body.map((node) => node.compile(figure));

    var figures = compileWalk(figure);

    var fns = [];
    for (let [name, fn] of figures) {
      fns.push(
        sourceNode(this.loc, '  "' + name + '": ')
          .add(fn)
      );
    }

    return sourceNode(this.loc, fns).join(',\n');
  };
}

function compileWalk(figure) {
  var figures = [];
  var fn = figure.compile();

  figures.push([figure.name, fn]);

  for (let subFigure of figure.subFigures) {
    figures.concat(compileWalk(subFigure));
  }

  return figures;
}

