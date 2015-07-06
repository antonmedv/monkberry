var Visitor = require('./visitor');
var TextParser = require('./parsers/text');
var VariableParser = require('./parsers/variable');
var ForeachParser = require('./parsers/foreach');

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
    code = "var monkberry = require('../../../monkberry');\n"
    + "var filters = monkberry.filters;\n"
    + "var document = window.document;\n"
    + 'module.exports = {\n' + code + '};\n';
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

  if (this.declarations.length > 0) {
    code += '  // Create elements\n';
    code += '  var ' + indent(this.declarations.join(',\n'), 4) + ';\n';
    code += '\n';
  }

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
  code += '  var view = monkberry.view();\n';
  code += '  view.update = function (data) {\n';
  code += '    ' + indent(this.compileUpdate(), 4) + '\n';
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

  var textParser = this.compileVariables(node.data, function (code) {
    return nodeName + ".nodeValue = " + code;
  });

  if (textParser.variables.length > 0) {
    this.declarations.push(nodeName + " = document.createTextNode(" + esc(textParser.rawText()) + ")");
    return nodeName;
  } else {
    return "document.createTextNode(" + esc(textParser.rawText()) + ")";
  }
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

  return code.join(';\n') + (code.length ? ';' : '');
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
    if (key == 'id') {
      var id = _this.compileVariables(attributes[key], function (code) {
        return nodeName + ".id = " + code;
      });
      _this.construct.push(nodeName + ".id = " + esc(id.rawText()) + ";");
    } else {
      var attr = _this.compileVariables(attributes[key], function (code) {
        return nodeName + ".setAttribute('" + key + "', " + code + ")";
      });
      // Skip default value for next attributes if them contains variables.
      if (attr.variables.length == 0 || ['src', 'href'].indexOf(key) === -1) {
        _this.construct.push(nodeName + ".setAttribute('" + key + "', " + esc(attr.rawText()) + ");")
      }
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

  return textParser;
};

Compiler.prototype.ifNode = function (node) {
  if (!node.attribs.test) {
    throw new Error('If node must contains "test" attribute.');
  }

  var variable = new VariableParser(node.attribs.test);

  var templateName;
  if (node.attribs.name) {
    templateName = node.attribs.name
  } else {
    templateName = this.name + '.if' + this.uniqid('template_name');
  }

  var childrenName = 'child' + this.uniqid('children_name');

  var placeholder, parentNode = this.lookUpOnlyOneChild(node);
  if (parentNode) {
    placeholder = parentNode.nodeName;
  } else {
    placeholder = 'if' + this.uniqid('placeholder');
    this.declarations.push(placeholder + " = document.createComment('if')");
  }

  if (node.children.length > 0) {
    this.subTemplates.push(new Compiler(templateName, node.children));
  }

  this.declarations.push(childrenName + " = {}");
  this.variables[variable.name] = variable;
  this.controlStructures.push(
    "if (data." + variable.name + " !== undefined) \n" +
    "  monkberry.insert(view, " +
    placeholder + ", " +
    childrenName + ", '" +
    templateName + "', " +
    "data, " +
    variable.toString('data.' + variable.name) +
    ")"
  );

  return parentNode ? null : placeholder;
};

Compiler.prototype.forNode = function (node) {
  if (!node.attribs.each) {
    throw new Error('For node must contains "each" attribute.');
  }

  var foreach = new ForeachParser(node.attribs.each);
  var variable = foreach.variable;
  var options = null;

  if (foreach.valueName) {
    options = {
      valueName: foreach.valueName
    };

    if (foreach.keyName) {
      options.keyName = foreach.keyName;
    }
  }

  var templateName;
  if (node.attribs.name) {
    templateName = node.attribs.name
  } else {
    templateName = this.name + '.for' + this.uniqid('template_name');
  }

  var childrenName = 'children' + this.uniqid('children_name');

  var placeholder, parentNode = this.lookUpOnlyOneChild(node);
  if (parentNode) {
    placeholder = parentNode.nodeName;
  } else {
    placeholder = 'for' + this.uniqid('placeholder');
    this.declarations.push(placeholder + " = document.createComment('for')");
  }

  this.subTemplates.push(new Compiler(templateName, node.children));
  this.declarations.push(childrenName + " = monkberry.map()");
  this.variables[variable.name] = variable;
  this.addSetters(variable.name,
    "monkberry.foreach(view, " +
    placeholder + ", " +
    childrenName + ", '" +
    templateName + "', " +
    variable.toString('value') +
    (options !== null ? ', ' + esc(options) : '') +
    ")"
  );

  return parentNode ? null : placeholder;
};

Compiler.prototype.customNode = function (node) {
  var customNodeName = node.name;
  var templateName = customNodeName;
  var childrenName = 'child' + this.uniqid('children_name');

  if (node.children.length) {
    this.subTemplates.push(new Compiler(templateName, node.children));
  }

  var placeholder, parentNode = this.lookUpOnlyOneChild(node);
  if (parentNode) {
    placeholder = parentNode.nodeName;
  } else {
    placeholder = placeholder = 'custom' + this.uniqid('placeholder');
    this.declarations.push(placeholder + " = document.createComment('" + customNodeName + "')");
  }

  this.declarations.push(childrenName + " = {}");
  this.controlStructures.push(
    "monkberry.insert(view, " +
    placeholder + ", " +
    childrenName + ", '" +
    templateName + "', " +
    "data, " +
    "1" +
    ")"
  );

  return parentNode ? null : placeholder;
};

Compiler.prototype.lookUpOnlyOneChild = function (node) {
  var parent = node.parent;
  if (parent) {
    if (parent.nodeName) {
      if (parent.children.length == 1 && parent.children[0] == node) {
        return parent;
      }
    }
  }
  return null;
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
