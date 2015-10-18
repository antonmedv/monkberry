var Visitor = require('./visitor');
var Splitter = require('./parsers/splitter');
var ExpressionParser = require('./parsers/expression');
var ForeachParser = require('./parsers/foreach');
var SetterCompiler = require('./compiler/setter');
var uniqueName = require('./utils/uniq_name');
var size = require('./utils/size');
var indent = require('./utils/indent').indent;
var indentFromSecondLine = require('./utils/indent').indentFromSecondLine;

/**
 * Note what for local vars Monkberry uses λ which are valid ECMAScript 5.1 variable names.
 */
function Compiler(name, dom) {
  this.name = name;
  this.dom = dom;
  this.visitor = new Visitor(this);
  this.uniqCounters = {};
  this.declarations = [];
  this.construct = [];
  this.complexUpdaters = {};
  this.updaters = {};
  this.variables = {};
  this.updateActions = [];
  this.subTemplates = [];
  this.perceivedAsLibrary = false;
}

Compiler.prototype.visit = function (node) {
  return this.visitor.visit(node);
};

Compiler.prototype.compile = function (as_module) {
  var code = '';

  var walk = function (compiler) {
    var templates = [];

    var compiled = compiler.compileTemplate();

    // Add only in template does not perceived as library.
    if (!compiler.perceivedAsLibrary) {
      templates.push([compiler.name, compiled]);
    }

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
    parts.push('  "' + name + '": ' + indentFromSecondLine(fn));
  }

  code += parts.join(',\n') + '\n';

  if (as_module) {
    code = 'module.exports = function (monkberry, document) {\n'
      + indent('var filters = monkberry.filters;', undefined) + '\n'
      + indent('return {\n' + code + '};', undefined) + '\n'
      + '};\n'
  } else {
    code = '(function (monkberry, filters, document, undefined) {\n  '
      + indentFromSecondLine('monkberry.mount({\n' + code + '});')
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
    code += '  var ' + indentFromSecondLine(this.declarations.join(',\n'), 4) + ';\n';
    code += '\n';
  }

  if (this.construct.length > 0) {
    code += '  // Construct dom\n';
    code += indent(this.construct.join('\n'), 2) + '\n';
    code += '\n';
  }

  code += '  // Create view\n';
  code += '  var view = monkberry.view();\n';
  code += '\n';

  if (size(this.complexUpdaters) > 0) {
    code += '  // Complex setters functions\n';
    code += '  var __cache__ = view.cache = {};\n';
    code += '  var λ = {\n';
    code += indent(this.compileComplexSetters(), 4) + '\n';
    code += '  };\n';
    code += '\n';
  }

  if (size(this.updaters) > 0) {
    code += '  // Setters functions\n';
    code += '  view.set = {\n';
    code += indent(this.compileSetters(), 4) + '\n';
    code += '  };\n';
    code += '\n';
  }

  if (this.updateActions.length > 0) {
    code += '  // Extra update function\n';
    code += '  view._update = function (__data__) {\n';
    code += indent(this.compileUpdateActions(), 4) + '\n';
    code += '  };\n';
    code += '\n';
  }

  code += '  // Set root nodes\n';
  code += '  view.nodes = [' + children.join(', ') + '];\n';
  code += '  return view;\n';

  code += '}';
  return code;
};

Compiler.prototype.compileSetters = function () {
  var code = [];
  var _this = this;
  Object.keys(this.updaters).forEach(function (key) {
    code.push(key + ': ' + _this.updaters[key].compile());
  });
  return code.join(',\n');
};

Compiler.prototype.compileComplexSetters = function () {
  var code = [];
  var _this = this;
  Object.keys(this.complexUpdaters).forEach(function (key) {
    code.push(key + ': ' + _this.complexUpdaters[key].compile());
  });
  return code.join(',\n');
};

Compiler.prototype.compileUpdateActions = function () {
  var code = [];
  for (var control of this.updateActions) {
    code.push(control);
  }
  return code.join(';\n') + (code.length ? ';' : '');
};

Compiler.prototype.textNode = function (node) {
  var nodeName = 'text' + this.uniqid();

  var expression = this.compileExpression(new Splitter(node.data), function (code) {
    return nodeName + ".nodeValue = " + code;
  });

  if (expression.variables.length > 0) {
    this.declarations.push(nodeName + " = document.createTextNode(" + esc(expression.rawText()) + ")");
    return nodeName;
  } else {
    return "document.createTextNode(" + esc(expression.rawText()) + ")";
  }
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

Compiler.prototype.svgNode = function (node) {
  var nodeName = node.name + this.uniqid();
  node.nodeName = nodeName;

  this.declarations.push(nodeName + " = document.createElementNS('http://www.w3.org/2000/svg', '" + node.name + "')");

  if (node.name == 'svg') {
    this.construct.push(nodeName + ".setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');");
  }

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
      var id = _this.compileExpression(new Splitter(attributes[key]), function (code) {
        return nodeName + ".id = " + code;
      });
      _this.construct.push(nodeName + ".id = " + esc(id.rawText()) + ";");
    } else {
      var attr = _this.compileExpression(new Splitter(attributes[key]), function (code) {
        return nodeName + ".setAttribute('" + key + "', " + code + ")";
      });
      // Skip default value for next attributes if them contains variables.
      if (attr.variables.length == 0 || ['src', 'href'].indexOf(key) === -1) {
        _this.construct.push(nodeName + ".setAttribute('" + key + "', " + esc(attr.rawText()) + ");")
      }
    }
  });
};

Compiler.prototype.compileExpression = function (expression, callback, dataDependent) {
  dataDependent = dataDependent || false;

  if (expression.variables.length == 1) {
    this.onSetter(expression.variables[0]).add(callback(expression.toCode()));
  } else if (expression.variables.length > 1) {
    var complexSetter = this.onComplexSetter(expression.variables);
    complexSetter.add(callback(expression.toCode()));

    if (dataDependent) {
      complexSetter.dataDependent();
    }

    for (variable of expression.variables) {
      this.onSetter(variable).cache();
      this.onSetter(variable).addComplex(expression.variables, complexSetter.name);
    }
  }

  return expression;
};

Compiler.prototype.directiveNode = function (node) {
  if (node.name == '!library') {
    this.perceivedAsLibrary = true;
  }
};

Compiler.prototype.ifNode = function (node) {
  if (!node.attribs.test) {
    throw new Error('If node must contains "test" attribute.');
  }

  var expression = new ExpressionParser(node.attribs.test);

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
  this.compileExpression(expression, function (code) {
    return "monkberry.insert(view, " +
      placeholder + ", " +
      childrenName + ", '" +
      templateName + "', " +
      "__data__, " +
      code +
      ")"
  }, true);

  return parentNode ? null : placeholder;
};

Compiler.prototype.forNode = function (node) {
  if (!node.attribs.each) {
    throw new Error('For node must contains "each" attribute.');
  }

  var foreach = new ForeachParser(node.attribs.each);
  var expression = foreach.expression;
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
  this.compileExpression(expression, function (code) {
    return "monkberry.foreach(view, " +
      placeholder + ", " +
      childrenName + ", '" +
      templateName + "', " +
      '__data__, ' +
      code +
      (options !== null ? ', ' + esc(options) : '') +
      ")"
  });

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
  this.updateActions.push(
    "monkberry.insert(view, " +
    placeholder + ", " +
    childrenName + ", '" +
    templateName + "', " +
    "__data__, " +
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

Compiler.prototype.onSetter = function (variableName) {
  return variableName in this.updaters ? this.updaters[variableName] : this.updaters[variableName] = new SetterCompiler([variableName]);
};

Compiler.prototype.onComplexSetter = function (variables) {
  var name = uniqueName(variables);
  return name in this.complexUpdaters ? this.complexUpdaters[name] : this.complexUpdaters[name] = new SetterCompiler(variables);
};

Compiler.prototype.uniqid = function (counter) {
  var name = counter || 'tag';
  if (!this.uniqCounters[name]) {
    this.uniqCounters[name] = 0
  }
  return this.uniqCounters[name]++;
};

function esc(str) {
  return JSON.stringify(str);
}

module.exports = Compiler;
