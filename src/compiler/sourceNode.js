import { SourceNode } from 'source-map';

export function sourceNode(loc, chunk) {
  if (loc === null) {
    return new SourceNode(null, null, null, chunk);
  } else {
    return new SourceNode(loc.start.line, loc.start.column, loc.source, chunk);
  }
}

export function join(parts, separator = '') {
  return sourceNode(null, parts).join(separator);
}
