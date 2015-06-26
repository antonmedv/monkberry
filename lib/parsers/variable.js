var
  T_NAME = 'T_NAME',
  T_STRING = 'T_STRING',
  T_BRACKET = 'T_BRACKET', // "("
  T_SQUARE = 'T_SQUARE', // "["
  T_CURLY = 'T_CURLY', // "{"
  T_APPLY = 'T_APPLY', // "|"
  T_DOT = 'T_DOT',// "."
  T_OTHER = 'T_OTHER';

function tokenize(str) {
  var
    tokens = [],
    n = 0,
    push = function (type, ch) {
      if (typeof tokens[n] === "undefined")
        tokens[n] = [type, ''];
      if (tokens[n][0] !== type)
        tokens[++n] = [type, ''];
      tokens[n][1] += ch;
    },
    push_one = function (type, ch) {
      push(type, ch);
      ++n;
    };

  for (var i = 0, len = str.length; i < len; ++i) {
    var ch = str[i];

    if (/\s/.test(ch))
      continue;
    else if (/[a-z0-9_]/i.test(ch))
      push(T_NAME, ch);
    else if (/[\(\)]/.test(ch))
      push_one(T_BRACKET, ch);
    else if (/[\[\]]/.test(ch))
      push_one(T_SQUARE, ch);
    else if (/[\{\}]/.test(ch))
      push_one(T_CURLY, ch);
    else if (/\./.test(ch))
      push_one(T_DOT, ch);
    else if (/\|/.test(ch))
      push_one(T_APPLY, ch);
    else if (/["']/.test(ch)) {
      push(T_STRING, ch);
      while (++i < len) {
        push(T_STRING, str[i]);
        if (str[i] == ch && str[i - 1] != '\\') {
          break;
        }
      }
    } else
      push(T_OTHER, ch);
  }

  return tokens;
}

function feed_until(tokens, t_until) {
  var t, level = 0, buffer = '';
  while (t = tokens.shift()) {
    buffer += t[1];
    if (t[0] == T_BRACKET) {
      if ('(' == t[1])
        ++level;
      else if (')' == t[1])
        --level;
    }
    if (tokens.length > 0 && level == 0 && t_until.indexOf(tokens[0][0]) != -1)
      break;
  }
  return buffer;
}

function parse(tokens) {
  var t, syn = {
    name: null,
    accessor: null,
    filters: []
  };

  t = tokens.shift();
  if (t[0] == T_NAME) {
    syn.name = t[1];
  } else {
    throw new Error('Variable name expected first.');
  }

  if (tokens.length > 0) {
    if (tokens[0][0] == T_DOT || tokens[0][0] == T_SQUARE) {
      syn.accessor = (feed_until(tokens, [T_APPLY]))
    }

    while (tokens.length > 0 && tokens[0][0] == T_APPLY) {
      tokens.shift();
      var filter = {
        name: feed_until(tokens, [T_APPLY, T_BRACKET]),
        params: null
      };
      if (tokens.length > 0 && tokens[0][0] == T_BRACKET) {
        filter.params = ', ' + feed_until(tokens, T_APPLY).replace(/^\(/, '').replace(/\)$/, '');
      }
      syn.filters.push(filter);
    }
  }

  if (tokens.length > 0) {
    throw new Error('Unrecognized token: "' + tokens[0][1] + '".');
  }

  return syn;
}

function VariableParser(variableString) {
  var syn = parse(tokenize(variableString));
  this.name = syn.name;
  this.accessor = syn.accessor;
  this.filters = syn.filters;
}

VariableParser.prototype.toString = function (data) {
  if (this.accessor) {
    data = data + this.accessor;
  }
  var filter;
  while (filter = this.filters.shift()) {
    data = 'filters.' + filter.name + '(' + data + (filter.params || '') + ')';
  }
  return data;
};

module.exports = VariableParser;
