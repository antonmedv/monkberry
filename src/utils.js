export function map(array, fn) {
  return array.map(fn).filter((item) => item !== null);
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

export function uniqueName(params) {
  return unique(params).sort().join('_');
}
