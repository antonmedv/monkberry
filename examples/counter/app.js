var count = 0;
monkberry.filters.toArray = function (count) {
  return new Array(count);
};
var view = monkberry.render('view', {
  title: 'Monkberry Counter Example',
  count: count
});
document.body.appendChild(view.dom());

document.getElementById('plus').addEventListener('click', function () {
  view.update({count: ++count})
});

document.getElementById('minus').addEventListener('click', function () {
  view.update({count: --count})
});
