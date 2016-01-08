describe('SVG tags', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should properly render', function () {
    var view = monkberry.render('Icon');
    expect(view).toBe('<svg width="120" height="30" viewBox="0 0 120 30" fill="red"><circle cx="15" cy="15" r="15"></circle><circle cx="60" cy="15" r="9" fill-opacity=".3"></circle><circle cx="105" cy="15" r="15"></circle></svg>');
  });
});