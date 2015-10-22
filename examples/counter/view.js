(function (monkberry, filters, document, undefined) {
monkberry.mount({
"view": function () {
  // Create elements
  var h10 = document.createElement('h1');
  var text1 = document.createTextNode('');
  var section2 = document.createElement('section');
  var button3 = document.createElement('button');
  var span4 = document.createElement('span');
  var text5 = document.createTextNode('');
  var button6 = document.createElement('button');
  var div7 = document.createElement('div');
  var child0 = {};
  var child1 = {};

  // Construct dom
  h10.appendChild(text1);
  button3.appendChild(document.createTextNode("+"));
  button3.setAttribute("id", "plus");
  span4.appendChild(document.createTextNode(" Count: "));
  span4.appendChild(text5);
  button6.appendChild(document.createTextNode("-"));
  button6.setAttribute("id", "minus");
  section2.appendChild(button3);
  section2.appendChild(span4);
  section2.appendChild(button6);
  section2.appendChild(div7);

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    title: function (__data__, title) {
      text1.textContent = title;
    },
    count: function (__data__, count) {
      text5.textContent = count;
      result = monkberry.insert(view, div7, child0, 'view.if0', __data__, (count) < (0));
      monkberry.insert(view, div7, child1, 'view.if0.else', __data__, !result);
    },
    key: function (__data__, key) {
      child1.ref && child1.ref.__update__.key(__data__, key);
    }
  };

  // Set root nodes
  view.nodes = [h10, section2];
  return view;
},
"view.if0": function () {
  // Create view
  var view = monkberry.view();

  // Set root nodes
  view.nodes = [document.createTextNode(" Counter is negative. ")];
  return view;
},
"view.if0.else": function () {
  // Create elements
  var ul0 = document.createElement('ul');
  var children0 = monkberry.map();

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    count: function (__data__, count) {
      monkberry.foreach(view, ul0, children0, 'view.if0.else.for0', __data__, filters.toArray(count), {"key":"key","value":"value"});
    }
  };

  // Set root nodes
  view.nodes = [ul0];
  return view;
},
"view.if0.else.for0": function () {
  // Create elements
  var li0 = document.createElement('li');
  var text1 = document.createTextNode('');

  // Construct dom
  li0.appendChild(text1);

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    key: function (__data__, key) {
      text1.textContent = (key) + (1);
    }
  };

  // Set root nodes
  view.nodes = [li0];
  return view;
}
});
})(monkberry, monkberry.filters, window.document, void 0);
//# sourceMappingURL=view.js.map
