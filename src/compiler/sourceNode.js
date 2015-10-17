import { SourceNode } from 'source-map';

export function sourceNode(loc, chunk) {
  return new SourceNode(loc.start.line, loc.start.column, loc.source, chunk);
}
