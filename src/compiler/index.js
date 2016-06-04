import { Figure } from '../figure';
import { Root } from '../figure/root';
import document from './document';
import element from './element';
import attribute from './attribute';
import expression from './expression';
import text from './text';
import comment from './comment';
import import_ from './import';
import if_ from './if';
import for_ from './for';
import block from './block';
import unsafe from './unsafe';

const compilers = Object.assign({},
  document,
  element,
  attribute,
  expression,
  text,
  comment,
  import_,
  if_,
  for_,
  block,
  unsafe
);

function next(parent, node, figure) {
  let path = {
    parent,
    node,
    figure,
    compile: (child, subfigure = figure) => next(node, child, subfigure)
  };

  if (node.type in compilers) {
    return compilers[node.type](path);
  } else {
    throw new Error(`Unknown node type "${node.type}".`);
  }
}

export function compile(name, ast) {
  return next(null, ast, new Figure(name, new Root()));
}
