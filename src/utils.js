export function indent(code, to = 2, skipFirst = false) {
  var i = skipFirst ? 1 : 0;
  var lines = code.split('\n');
  for (var len = lines.length; i < len; i++) {
    lines[i] = new Array(value + 1).join(' ') + lines[i];
  }
  return lines.join('\n');
}

export function indentFromSecondLine(code, to) {
  return indent(code, to, true);
}

export function size(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      size++;
    }
  }
  return size;
}

export function unique(a) {
  return a.reduce(function (p, c) {
    if (p.indexOf(c) < 0) {
      p.push(c);
    }
    return p;
  }, []);
}

export function uniquename(params) {
  return unique(params).sort().join('_');
}
