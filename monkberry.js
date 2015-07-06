(function (document) {
  function Monkberry() {
    this.pool = new Pool();
    this.templates = {};
    this.filters = {};
    this.wrappers = {};
  }

  Monkberry.prototype.foreach = function (parent, node, children, template, data, options) {
    var i, j, len, childrenSize = children.length;

    len = childrenSize - data.length;
    for (i in children.items) {
      if (len-- > 0) {
        children.items[i].remove();
      } else {
        break;
      }
    }

    j = 0;
    for (i in children.items) {
      children.items[i].update(forData(data[j], j, options));
      j++;
    }

    for (j = childrenSize, len = data.length; j < len; j++) {
      var view = this.render(template);
      view.parent = parent;
      parent.children.push(view);
      view.appendTo(node);
      view.update(forData(data[j], j, options));
      i = children.push(view);
      view.onRemove = (function (i) {
        return function () {
          children.remove(i);
        };
      })(i);
    }
  };

  Monkberry.prototype.insert = function (parent, node, child/*.ref*/, template, data, test) {
    if (child.ref) {
      if (test) {
        child.ref.update(data);
      }
      else {
        child.ref.remove();
      }
    } else if (test) {
      var view = this.render(template);
      view.parent = parent;
      parent.children.push(view);
      view.appendTo(node);
      view.update(data);
      child.ref = view;
      view.onRemove = function () {
        child.ref = null;
      };
    }
  };

  Monkberry.prototype.render = function (name, values, no_cache) {
    no_cache = no_cache || false;

    if (this.templates[name]) {
      var view, self = this;

      if (no_cache) {
        view = this.templates[name]();
        view.name = name;
        view.pool = this.pool;
      } else {
        view = this.pool.pull(name);
        if (!view) {
          view = this.templates[name]();
          view.name = name;
          view.pool = this.pool;
        }
      }

      if (values !== undefined) {
        view.update(values);
      }

      view.wrapped = view.wrapped || {};
      if (this.wrappers[name] && !view.wrapped[name]) {
        view = this.wrappers[name](view);
        view.wrapped[name] = true;
      }

      return view;
    } else {
      throw new Error('Template with name "' + name + '" does not found.');
    }
  };

  Monkberry.prototype.prerender = function (name, times) {
    while (times--) {
      this.pool.push(name, this.render(name, undefined, true));
    }
  };

  Monkberry.prototype.mount = function (templates) {
    var _this = this;
    Object.keys(templates).forEach(function (name) {
      _this.templates[name] = templates[name];
    });
  };

  Monkberry.prototype.view = function () {
    return new View;
  };

  Monkberry.prototype.map = function () {
    return new Map;
  };

  function View() {
    this.name = '';
    this.parent = null;
    this.children = [];
    this.nodes = [];
  }

  View.prototype.appendTo = function (toNode) {
    for (var i = 0, len = this.nodes.length; i < len; i++) {
      if (toNode.nodeType == 8) {
        if (toNode.parentNode) {
          toNode.parentNode.insertBefore(this.nodes[i], toNode);
        } else {
          throw new Error("Can not insert child view into parent node." +
          "You need append your view first and then update.");
        }
      } else {
        toNode.appendChild(this.nodes[i]);
      }
    }
  };

  View.prototype.dom = function (toNode) {
    if (this.nodes.length == 1) {
      return this.nodes[0];
    } else {
      var fragment = document.createDocumentFragment();
      for (var i = 0, len = this.nodes.length; i < len; i++) {
        fragment.appendChild(this.nodes[i]);
      }
      return fragment;
    }
  };

  View.prototype.remove = function () {
    // Remove appended nodes
    var i = this.nodes.length;
    while (i--) {
      this.nodes[i].parentNode.removeChild(this.nodes[i]);
    }
    // Remove self from parent's children map
    if (this.onRemove) {
      this.onRemove();
    }
    // Remove all children views
    i = this.children.length;
    while (i--) {
      this.children[i].remove();
    }
    // Remove this view from parent views children.
    if (this.parent) {
      i = this.parent.children.indexOf(this);
      this.parent.children.splice(i, 1);
    }
    this.pool.push(this.name, this);
  };

  function Pool() {
    this.store = {};
  }

  Pool.prototype.push = function (name, view) {
    if (!this.store[name]) {
      this.store[name] = [];
    }
    this.store[name].push(view);
  };

  Pool.prototype.pull = function (name) {
    if (this.store[name]) {
      return this.store[name].pop();
    } else {
      return void 0;
    }
  };

  // Helper functions for working with "map".

  function Map() {
    this.items = Object.create(null);
    this.length = 0;
    this.next = 0;
  }

  Map.prototype.push = function (element) {
    this.items[this.next] = element;
    this.length += 1;
    this.next += 1;
    return this.next - 1;
  };

  Map.prototype.remove = function (i) {
    if (i in this.items) {
      delete this.items[i];
      this.length -= 1;
    } else {
      // TODO: Remove this in future, after API stabilization.
      throw new Error('You are trying to delete not existing element "' + i + '" form map.');
    }
  };

  // Helper function for working with foreach loops data.

  function forData(data, i, options) {
    if (options) {
      var newData = {};
      newData[options.valueName] = data;

      if (options.keyName) {
        newData[options.keyName] = i;
      }

      return newData;
    } else {
      return data;
    }
  }

  if (typeof module !== "undefined") {
    module.exports = new Monkberry();
  } else {
    window.monkberry = new Monkberry();
  }
})(window.document);
