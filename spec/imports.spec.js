describe('Import', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should require and mount template', function () {
    var view = monkberry.render('Import');
    expect(view).toBe('<section><div> Custom tag </div></section>');
  });
});