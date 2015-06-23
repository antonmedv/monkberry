var Visitor = require('./visitor');
var TextParser = require('./parsers/text');
var VariableParser = require('./parsers/variable');

function indent(code, to, skip_first) {
  var value = to || 2;
  var i = skip_first === undefined ? 1 : 0;
  var lines = code.split('\n');
  for (var len = lines.length; i < len; i++) {
    lines[i] = new Array(value + 1).join(' ') + lines[i];
  }
  return lines.join('\n');
}

function esc(str) {
  return JSON.stringify(str);
}

function Compiler(name, dom) {
  this.name = name;
  this.dom = dom;
  this.visitor = new Visitor(this);
  this.uniqCounters = {};
  this.declarations = [];
  this.construct = [];
  this.setters = {};
  this.variables = {};
  this.subTemplates = [];
}

Compiler.prototype.visit = function (node) {
  return this.visitor.visit(node);
};

Compiler.prototype.compile = function (as_module) {
  var code = '';

  var main = [this.name, this.compileTemplate()];
  this.subTemplates.unshift(main);

  var parts = [];
  for (var template of this.subTemplates) {
    var name = template[0];
    var fn = template[1];
    parts.push('  "' + name + '": ' + indent(fn));
  }

  code += parts.join(',\n') + '\n';

  if (as_module) {
    code = 'module.exports = {' + code + '};\n';
  } else {
    code = '(function (monkberry, document) {\n  '
    + indent('monkberry.mount({\n' + code + '});')
    + '\n})(monkberry, window.document);\n';
  }
  return code;
};

Compiler.prototype.compileTemplate = function () {
  var children = this.visit(this.dom);
  var code = '';
  code += 'function () {\n';
  code += '  // Create elements:\n';
  code += '  var ' + indent(this.declarations.join(',\n'), 4) + ';\n';
  code += '\n';
  code += '  // Construct dom:\n';
  code += '  ' + indent(this.construct.join('\n'), 2) + '\n';
  code += '\n';
  code += '  // Create view:\n';
  code += '  var view = {\n';
  code += '    dom: null,\n';
  code += '    setters: {\n';
  code += '      ' + indent(this.compileSetters(), 6) + '\n';
  code += '    },\n';
  code += '    update: function (data) {\n';
  code += '    }\n';
  code += '  };\n';
  code += '\n';
  code += '  // Set DOM:\n';
  if (children.length === 1) {
    code += '  view.dom = ' + children[0] + ';\n';
  } else if (children.length > 1) {
    code += '  view.dom = document.createDocumentFragment();\n';
    for (var child of children) {
      code += '  view.dom.appendChild(' + child + ');\n';
    }
  }
  code += '  return view;\n';
  code += '}';
  return code;
};

Compiler.prototype.compileSetters = function () {
  var code = [];
  var _this = this;
  Object.keys(this.setters).forEach(function (key) {
    code.push(key + ": function (value) {\n" + indent(_this.setters[key].join(';\n'), 2, false) + ";\n}");
  });
  return code.join(',\n');
};

Compiler.prototype.textNode = function (node) {
  var nodeName = 'text' + this.uniqid();

  var text = this.compileVariables(node.data, function (code) {
    return nodeName + ".nodeValue = " + code;
  });
  this.declarations.push(nodeName + " = document.createTextNode(" + esc(text) + ")");

  return nodeName;
};

Compiler.prototype.compileText = function (parts, names) {
  var code = [];

  var i = 0;
  for (var part of parts) {
    if (part !== '') {
      code.push(esc(part));
    }
    if (i < names.length) {
      code.push(names[i++]);
    }
  }
  return code.join(' + ');
};

Compiler.prototype.tagNode = function (node) {
  var nodeName = node.name + this.uniqid();

  this.declarations.push(nodeName + " = document.createElement(" + node.name + ")");

  var children = this.visit(node.children);
  for (var child of children) {
    this.construct.push(nodeName + ".appendChild(" + child + ");");
  }

  this.compileAttributes(nodeName, node.attribs);

  return nodeName;
};

Compiler.prototype.compileAttributes = function (nodeName, attributes) {
  var _this = this;
  Object.keys(attributes).forEach(function (key) {
    if (key === 'id') {
      var id = _this.compileVariables(attributes[key], function (code) {
        return nodeName + ".id = " + code;
      });
      _this.construct.push(nodeName + ".id = " + esc(id) + ";");
    } else {
      var attr = _this.compileVariables(attributes[key], function (code) {
        return nodeName + ".setAttribute('" + key + "', " + code + ")";
      });
      _this.construct.push(nodeName + ".setAttribute('" + key + "', " + esc(attr) + ");")
    }
  });
};

Compiler.prototype.compileVariables = function (input, callback) {
  var variable;
  var textParser = new TextParser(input);

  if (textParser.variables.length == 1) {

    variable = textParser.variables[0];
    this.variables[variable.name] = variable;
    this.addSetters(variable.name, callback(this.compileText(textParser.textParts, [variable.getFrom('value')])));

  } else if (textParser.variables.length > 1) {
    var valueNames = [];
    for (variable of textParser.variables) {
      var valueName = variable.name + '_value' + this.uniqid(variable.name);

      valueNames.push(valueName);
      this.declarations.push(valueName + " = ''");
      this.addSetters(variable.name, valueName + " = " + variable.getFrom('value'));
    }

    for (variable of textParser.getUniqueByVariableNames()) {
      this.variables[variable.name] = variable;
      this.addSetters(variable.name, callback(this.compileText(textParser.textParts, valueNames)));
    }
  }

  return textParser.rawText();
};

Compiler.prototype.ifNode = function (node) {
  if (!node.attribs.key) {
    throw new Error('If node must contains "key" attribute.');
  }

  var variable = new VariableParser(node.attribs.key);
  var templateName = this.name + '_if_' + variable.name + this.uniqid('template_name');
  var compiler = new Compiler(this.name, node.children);

  this.subTemplates.push([templateName, compiler.compileTemplate()]);

  var nodeName = 'if' + this.uniqid('if');

  this.declarations.push(nodeName + " = document.createDocumentFragment()");

  this.variables[variable.name] = variable;
  this.addSetters(variable.name, "monkberry.append(" + nodeName + ", '" + templateName + "', " + variable.getFrom('value') + ")");

  return nodeName;
};

Compiler.prototype.forNode = function (node) {
  if (!node.attribs.key) {
    throw new Error('For node must contains "key" attribute.');
  }

  var variable = new VariableParser(node.attribs.key);
  var templateName = this.name + '_for_' + variable.name + this.uniqid('template_name');
  var compiler = new Compiler(this.name, node.children);

  this.subTemplates.push([templateName, compiler.compileTemplate()]);

  var nodeName = 'for' + this.uniqid('for');

  this.declarations.push(nodeName + " = document.createDocumentFragment()");

  this.variables[variable.name] = variable;
  this.addSetters(variable.name, "monkberry.append(view, " + nodeName + ", '" + templateName + "', " + variable.getFrom('value') + ")");

  return nodeName;
};

Compiler.prototype.customNode = function (node) {
  this.opcodes.push([]);
  var subTemplate = new Compiler(this.name, node.children);
  this.subTemplates.push(subTemplate.compile());
};

Compiler.prototype.addSetters = function (forVariable, opcode) {
  if (!this.setters[forVariable]) {
    this.setters[forVariable] = [];
  }
  this.setters[forVariable].push(opcode);
};

Compiler.prototype.uniqid = function (counter) {
  var name = counter || 'tag';
  if (!this.uniqCounters[name]) {
    this.uniqCounters[name] = 0
  }
  return this.uniqCounters[name]++;
};

module.exports = Compiler;
