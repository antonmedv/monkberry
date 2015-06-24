(function (window) {
  function Monkberry() {
    this.pool = new Pool();
    this.templates = {};
    this.filters = {};
    this.wrappers = {};
  }

  Monkberry.prototype.foreach = function foreach(parent, node, children, template, data) {
    var i, j, len, childrenSize = Map.size(children);

    len = childrenSize - data.length;
    for (i in children) if (children.hasOwnProperty(i)) {
      if (len-- > 0) {
        children[i].remove();
      } else {
        break;
      }
    }

    j = 0;
    for (i in children) if (children.hasOwnProperty(i)) {
      children[i].update(data[j++]);
    }

    for (j = childrenSize, len = data.length; j < len; j++) {
      var view = this.render(template, data[j]);
      view.parent = parent;

      view.appendTo(node);
      i = Map.push(children, view);

      var removeNodes = view.remove;
      view.remove = (function (i, view, removeNodes) {
        return function () {
          removeNodes();
          Map.remove(children, i);
        };
      })(i, view, removeNodes);
    }
  };

  Monkberry.prototype.render = function render(name, values, no_cache) {
    no_cache = no_cache || false;

    if (this.templates[name]) {
      var view, self = this;

      if (no_cache) {
        view = this.templates[name]();
      } else {
        view = this.pool.pull(name);
        if (!view) {
          view = this.templates[name]();
        }
      }

      view.appendTo = function (toNode) {
        for (var i = 0, len = view.nodes.length; i < len; i++) {
          var node = view.nodes[i];
          if (node instanceof PseudoNode) {
            node.appendTo(toNode);
            node.insertBeforePlaceholder();
          } else if (toNode instanceof PseudoNode) {
            toNode.pushChild(node);
            toNode.insertBeforePlaceholder();
          } else {
            toNode.appendChild(node);
          }
        }
      };

      view.remove = function () {
        for (var i = 0, len = view.nodes.length; i < len; i++) {
          if (view.nodes[i] instanceof PseudoNode) {
            view.nodes[i].remove();
          } else {
            view.nodes[i].parentNode.removeChild(view.nodes[i]);
          }
        }
        self.pool.push(name, view);
      };

      if (values !== undefined) {
        view.update(values);
      }

      if (this.wrappers[name]) {
        view = this.wrappers[name](view);
      }

      return view;
    } else {
      throw new Error('Template with name "' + name + '" does not found.');
    }
  };

  Monkberry.prototype.prerender = function prerender(name, times) {
    while (times--) {
      this.pool.push(name, this.render(name, undefined, true));
    }
  };

  Monkberry.prototype.mount = function mount(templates) {
    var _this = this;
    Object.keys(templates).forEach(function (name) {
      _this.templates[name] = templates[name];
    });
  };

  Monkberry.prototype.pnode = function pnode(comment) {
    return new PseudoNode(comment);
  };

  function Pool() {
    this.store = {};
  }

  Pool.prototype.push = function push(name, view) {
    if (!this.store[name]) {
      this.store[name] = [];
    }
    this.store[name].push(view);
  };

  Pool.prototype.pull = function pull(name) {
    if (this.store[name]) {
      return this.store[name].pop();
    } else {
      return void 0;
    }
  };

  function Map() {
  }

  Map.max = function max(map) {
    var max = 0;
    for (var i in map) if (map.hasOwnProperty(i)) {
      if (i > max) {
        max = i;
      }
    }
    return parseInt(max);
  };

  Map.push = function push(map, element) {
    var max = Map.max(map) + 1;
    map[max] = element;
    return max;
  };

  Map.remove = function remove(map, i) {
    delete map[i];
  };

  Map.size = function size(map) {
    var size = 0;
    for (var i in map) if (map.hasOwnProperty(i)) {
      size++;
    }
    return size;
  };

  function PseudoNode(comment) {
    this.children = [];
    this.placeholderNode = document.createComment(comment || 'node');
  }

  PseudoNode.prototype.remove = function remove() {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i].parentNode) {
        this.children[i].parentNode.removeChild(this.children[i]);
        this.children.splice(i, 1);
      }
    }
  };

  PseudoNode.prototype.pushChild = function pushChild(node) {
    this.children.push(node);
  };

  PseudoNode.prototype.appendTo = function appendTo(node) {
    node.appendChild(this.placeholderNode);
  };

  PseudoNode.prototype.insertBeforePlaceholder = function insertBeforePlaceholder() {
    if (this.placeholderNode.parentNode) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        this.placeholderNode.parentNode.insertBefore(this.children[i], this.placeholderNode);
      }
    }
  };

  window.monkberry = new Monkberry();
})(window);
