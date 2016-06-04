var monkberry = require('monkberry');

function Test() {
  monkberry.call(this);

  // Create elements
  var div0 = document.createElement('div');
  var p1 = document.createElement('p');
  var undefined = document.createTextNode('');
  var input3 = document.createElement('input');
  var for0 = document.createComment('for');
  var children0 = monkberry.map();

  // Construct dom
  p1.appendChild(document.createTextNode(" Hello "));
  p1.appendChild(undefined);
  input3.setAttribute("type", "text");
  div0.appendChild(p1);
  div0.appendChild(input3);
  div0.appendChild(for0);
  div0.setAttribute("class", "container");

  // Update functions
  var _this = this;
  this.__update__ = {
    name_world: function (data) {
      text2.textContent = (data.world) + (data.name);
    },
    value: function (data) {
      input3.value = data.value;
    },
    outer: function (data) {
      monkberry.loop(_this, for0, children0, Test_for0, data, data.outer);
    }
  };

  // Set root nodes
  this.nodes = [div0];
}
Test.prototype = Object.create(monkberry.prototype);
Test.prototype.constructor = Test;
Test.prototype.update = function (data) {
  if (data.world) {
    this.__cache__.world = data.world;
  }
  if (data.name) {
    this.__cache__.name = data.name;
  }
  if (data.value) {
    this.__update__.value(data);
  }
  if (data.outer) {
    this.__update__.outer(data);
  }
  if(this.__cache__.world && this.__cache__.name) {
    this.__update__.name_world(data, this.__cache__.name, this.__cache__.world);
  }
};

function Test_for0() {
  // Create elements
  var section0 = document.createElement('section');
  var children0 = monkberry.map();

  // Construct dom
  section0.appendChild(null);

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    loop: function (__data__, loop) {
      monkberry.foreach(view, section0, children0, Test.for0.for0, __data__, loop);
    }
  };

  // Set root nodes
  this.nodes = [section0];

}
Test_for0.prototype = Object.create(monkberry.prototype);
Test_for0.prototype.constructor = Test_for0;
Test.prototype.update = function (data) {
  if (data.loop) {
    this.__update__.loop(data, data.loop);
  }
};

if (typeof module !== "undefined") {
  module.exports = Test;
} else {
  window.Test = Test;
}
