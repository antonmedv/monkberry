(function (monkberry, filters, document, undefined) {
monkberry.mount({
"view": function () {
  // Create elements
  var h10 = document.createElement('h1');
  var text1 = document.createTextNode('');
  var div2 = document.createElement('div');
  var child0 = {};;

  // Construct dom
  h10.appendChild(text1);

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    title: function (__data__, title) {
      text1.textContent = title;
    },
    on: function (__data__, on) {
      monkberry.insert(view, div2, child0, 'view.if0', __data__, on);
      child0.ref && child0.ref.__update__.on(__data__, on);
    }
  };

  // Set root nodes
  view.nodes = [h10, div2];
  return view;
},
"view.if0": function () {
  // Create elements
  var div0 = document.createElement('div');
  var text1 = document.createTextNode('');;

  // Construct dom
  div0.appendChild(text1);

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    on: function (__data__, on) {
      text1.textContent = (on) ? 'true' : 'false';
    }
  };

  // Set root nodes
  view.nodes = [div0];
  return view;
}
});
})(monkberry, monkberry.filters, window.document, void 0);
//# sourceMappingURL=view.js.map
