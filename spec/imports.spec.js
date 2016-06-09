describe('Import', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('html');
  });

  it('should require and mount template', function () {
    var view = Monkberry.render(imports, root);
    view.update({
      text: 'upper'
    });
    expect(view).toBe('<section>UPPER</section>');
  });
});