function esc(str) {
  return JSON.stringify(str);
}

function size(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      size++;
    }
  }
  return size;
}

function notNull(item) {
  return item !== null;
}

function unique(a) {
  return a.reduce(function (p, c) {
    if (p.indexOf(c) < 0) {
      p.push(c);
    }
    return p;
  }, []);
}

function isSingleChild(parent, node) {
  if (parent) {
    if (parent.type == 'Element') {
      if (parent.body.length == 1 && parent.body[0] == node) {
        return true;
      }
    }
  }
  return false;
}

function getTemplateName(name) {
  return name.replace(/\W+/g, '_');
}

function getStringLiteralValue(literal) {
  return literal.value.replace(/^["']/, '').replace(/["']$/, '');
}

function arrayToObject(array, value = 1) {
  var obj = {};
  for (var i = 0; i < array.length; i++) {
    obj[array[i]] = value;
  }
  return obj;
}

function hyphensToCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

module.exports = {
  esc,
  size,
  notNull,
  unique,
  isSingleChild,
  getTemplateName,
  getStringLiteralValue,
  arrayToObject,
  hyphensToCamelCase,
}
