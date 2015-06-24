var Visitor = require('./visitor');
var TextParser = require('./parsers/text');
var VariableParser = require('./parsers/variable');

function Compiler(name, dom) {
  this.name = name;
  this.dom = dom;
  this.visitor = new Visitor(this);
  this.uniqCounters = {};
  this.declarations = [];
  this.construct = [];
  this.setters = {};
  this.variables = {};
  this.controlStructures = [];
  this.subTemplates = [];
}

Compiler.prototype.visit = function (node) {
  return this.visitor.visit(node);
};

Compiler.prototype.compile = function (as_module) {
  var code = '';

  var walk = function (compiler) {
    var templates = [[compiler.name, compiler.compileTemplate()]];
    for (var sub of compiler.subTemplates) {
      for (var each of walk(sub)) {
        templates.push(each);
      }
    }
    return templates;
  };
  var templates = walk(this);

  var parts = [];
  for (var template of templates) {
    var name = template[0];
    var fn = template[1];
    parts.push('  "' + name + '": ' + indent(fn));
  }

  code += parts.join(',\n') + '\n';

  if (as_module) {
    code = 'module.exports = {' + code + '};\n';
  } else {
    code = '(function (monkberry, filters, document, undefined) {\n  '
    + indent('monkberry.mount({\n' + code + '});')
    + '\n})(monkberry, monkberry.filters, window.document, void 0);\n';
  }
  return code;
};

Compiler.prototype.compileTemplate = function () {
  var children = this.visit(this.dom);
  var code = '';
  code += 'function () {\n';

  code += '  // Create elements\n';
  code += '  var ' + indent(this.declarations.join(',\n'), 4) + ';\n';
  code += '\n';

  if (this.construct.length > 0) {
    code += '  // Construct dom\n';
    code += '  ' + indent(this.construct.join('\n'), 2) + '\n';
    code += '\n';
  }

  if (size(this.setters) > 0) {
    code += '  // Create setters\n';
    code += '  var set = {\n';
    code += '    ' + indent(this.compileSetters(), 4) + '\n';
    code += '  };\n';
  }

  code += '  // Create view\n';
  code += '  var view = {\n';
  if (size(this.variables) > 0) {
    code += '    update: function (data) {\n';
    code += '      ' + indent(this.compileUpdate(), 6) + '\n';
    code += '    }\n';
  } else {
    code += '    update: function () {}\n';
  }
  code += '  };\n';
  code += '\n';

  code += '  // Set root nodes\n';
  code += '  view.nodes = [' + children.join(', ') + '];\n';
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

Compiler.prototype.compileUpdate = function () {
  var code = [];

  if (size(this.setters) > 0) {
    code.push('var t');
    Object.keys(this.setters).forEach(function (varName) {
      code.push("(t = data." + varName + ") !== undefined && set." + varName + "(t)");
    });
  }

  for (var control of this.controlStructures) {
    code.push(control);
  }

  return code.join(';\n');
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
  node.nodeName = nodeName;

  this.declarations.push(nodeName + " = document.createElement('" + node.name + "')");

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
    this.addSetters(variable.name, callback(this.compileText(textParser.textParts, [variable.toString('value')])));

  } else if (textParser.variables.length > 1) {
    var valueNames = [];
    for (variable of textParser.variables) {
      var valueName = variable.name + '_value' + this.uniqid(variable.name);

      valueNames.push(valueName);
      this.declarations.push(valueName + " = ''");
      this.addSetters(variable.name, valueName + " = " + variable.toString('value'));
    }

    for (variable of textParser.getUniqueByVariableNames()) {
      this.variables[variable.name] = variable;
      this.addSetters(variable.name, callback(this.compileText(textParser.textParts, valueNames)));
    }
  }

  return textParser.rawText();
};

Compiler.prototype.ifNode = function (node) {
  if (!node.attribs.test) {
    throw new Error('If node must contains "key" attribute.');
  }

  var variable = new VariableParser(node.attribs.test);
  var templateName = this.name + '.if' + this.uniqid('template_name');
  var childrenName = 'children' + this.uniqid('children_name');
  var nodeName = null, placeholder;

  var parentNode = this.lookUpParent(node.parent);
  if (parentNode) {
    placeholder = parentNode.nodeName;
  } else {
    placeholder = 'if' + this.uniqid('placeholder');
    nodeName = placeholder;
    this.declarations.push(placeholder + " = new MonkberryNode()");
  }

  this.subTemplates.push(new Compiler(templateName, node.children));
  this.declarations.push(childrenName + " = {}");
  this.variables[variable.name] = variable;
  this.controlStructures.push(
    "if (" + variable.toString('data.' + variable.name) + ")\n" +
    "  monkberry.foreach(view, " +
    placeholder + ", " +
    childrenName + ", '" +
    templateName + "', " +
    "[data]" +
    ")"
  );

  return nodeName;
};

Compiler.prototype.forNode = function (node) {
  if (!node.attribs.each) {
    throw new Error('For node must contains "key" attribute.');
  }

  var variable = new VariableParser(node.attribs.each);
  var templateName = this.name + '.for' + this.uniqid('template_name');
  var childrenName = 'children' + this.uniqid('children_name');
  var nodeName = null, placeholder;

  var parentNode = this.lookUpParent(node.parent);
  if (parentNode) {
    placeholder = parentNode.nodeName;
  } else {
    placeholder = 'for' + this.uniqid('placeholder');
    nodeName = placeholder;
    this.declarations.push(placeholder + " = new MonkberryNode()");
  }

  this.subTemplates.push(new Compiler(templateName, node.children));
  this.declarations.push(childrenName + " = {}");
  this.variables[variable.name] = variable;
  this.addSetters(variable.name,
    "monkberry.foreach(view, " +
    placeholder + ", " +
    childrenName + ", '" +
    templateName + "', " +
    variable.toString('value') +
    ")"
  );

  return nodeName;
};

Compiler.prototype.customNode = function (node) {
  if (!node.attribs.key) {
    throw new Error(node.name + ' node must contains "key" attribute.');
  }

  var variable = new VariableParser(node.attribs.key);
  var templateName = node.name;
  var childrenName = 'children' + this.uniqid('children_name');
  var parentNode = this.lookUpParent(node.parent);
  if (parentNode) {
    var nodeName = parentNode.nodeName;
  } else {
    throw new Error(node.name + " tag must has a parent node.");
  }

  this.subTemplates.push(new Compiler(templateName, node.children));
  this.declarations.push(childrenName + " = {}");
  this.variables[variable.name] = variable;
  this.addSetters(variable.name, "monkberry.foreach(view, " + nodeName + ", " + childrenName + ", '" + templateName + "', [" + variable.toString('value') + "])");

};

Compiler.prototype.lookUpParent = function (node) {
  if (node && node.nodeName) {
    return node;
  } else {
    return false;
  }
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

function size(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

module.exports = Compiler;
