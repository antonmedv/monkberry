(function (monkberry, filters, document, undefined) {
monkberry.mount({
"view": function () {
  // Create elements
  var div0 = document.createElement('div');
  var div1 = document.createElement('div');
  var span2 = document.createElement('span');
  var text3 = document.createTextNode('');

  // Construct dom
  span2.appendChild(document.createTextNode("Hello, "));
  span2.appendChild(text3);
  span2.appendChild(document.createTextNode("!"));
  span2.setAttribute("style", "color:red");
  div1.appendChild(span2);
  div0.appendChild(div1);
  div0.setAttribute("class", ("monk-") + ("container"));

  // Create view
  var view = monkberry.view();

  // Update functions
  view.__update__ = {
    name: function (__data__, name) {
      text3.textContent = name;
    },
    type: function (__data__, type) {
      div1.setAttribute("class", (("monk-") + ("row ")) + (("monk-") + (type)));
    }
  };

  // Set root nodes
  view.nodes = [div0];
  return view;
}
});
})(monkberry, monkberry.filters, window.document, void 0);
//# sourceMappingURL=view.js.map
