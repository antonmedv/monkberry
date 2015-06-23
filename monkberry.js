(function (window) {
  function Monkberry() {
    this.pool = new Pool();
  }

  Monkberry.prototype.append = function (parent, node, children, template, data) {
    var i, len, self = this;

    for (i = 0, len = children.length - data.length; i < len; i++) {
      children[i].remove();
    }

    for (i = 0, len = children.length; i < len; i++) {
      children[i].update(data[i]);
    }

    for (i = children.length, len = data.length; i < len; i++) {
      var view = this.render(template, data[i]);
      view.parent = parent;
      view.remove = (function (i, view) {
        return function () {
          node.removeChild(view.dom);
          children.splice(i, 1);
          self.pool.push(template, view);
        };
      })(i, view);
      node.appendChild(view.dom);
    }
  };

  Monkberry.prototype.render = function (name, values) {

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

  window.monkberry = new Monkberry();
})(window);