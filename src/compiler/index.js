import { Figure } from '../figure';
import document from './document';
import element from './element';
import attribute from './attribute';
import directive from './directive';
import expression from './expression';
import text from './text';
import comment from './comment';
import import_ from './import';
import if_ from './if';
import for_ from './for';
import unsafe from './unsafe';

const compilers = Object.assign({},
  document,
  element,
  attribute,
  directive,
  expression,
  text,
  comment,
  import_,
  if_,
  for_,
  unsafe
);

function next(parent, node, figure, options) {
  let path = {
    parent,
    node,
    figure,
    options,
    compile: (child, subfigure = figure) => next(node, child, subfigure, options)
  };

  if (node.type in compilers) {
    return compilers[node.type](path);
  } else {
    throw new Error(`Unknown node type "${node.type}".`);
  }
}

export function compile(name, ast, options, globals) {
  let figure = new Figure(name);
  figure.scope = globals;
  return next(null, ast, figure, options);
}
