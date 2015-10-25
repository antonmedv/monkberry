var view = monkberry.render('view', {
  type: 'title',
  name: 'world',
  a: 'a',
  b: 'b',
  prefix: 'monk'
});
document.body.appendChild(view.dom());
