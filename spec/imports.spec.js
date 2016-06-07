describe('Import', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('html');
  });

  it('should require and mount template', function () {
    var view = Monkberry.render(Imports, root);
    expect(view).toBe('<section><div> Custom tag </div></section>');
  });
});