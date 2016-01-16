export function esc(str) {
  return JSON.stringify(str);
}

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

export function lookUpOnlyOneChild(node) {
  var parent = node.parent;
  if (parent) {
    if (parent.type == 'Element') {
      if (parent.body.length == 1 && parent.body[0] == node) {
        return parent;
      }
    }
  }
  return null;
}

export function arrayToObject(array, value = 1) {
  var obj = {};
  for (var i = 0; i < array.length; i++) {
    obj[array[i]] = value;
  }
  return obj;
}
