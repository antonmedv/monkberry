function indent(code, to, skip_first) {
  var value = to || 2;
  var i = skip_first ? 1 : 0;
  var lines = code.split('\n');
  for (var len = lines.length; i < len; i++) {
    lines[i] = new Array(value + 1).join(' ') + lines[i];
  }
  return lines.join('\n');
}

function indentFromSecondLine(code, to) {
  return indent(code, to, true);
}

module.exports = {
  indent: indent,
  indentFromSecondLine: indentFromSecondLine
};
