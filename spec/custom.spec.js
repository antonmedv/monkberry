describe('Custom tags', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should properly work', function () {
    var view = monkberry.render('Custom', {
      value: 'title',
      text: 'content'
    });
    expect(view).toBe('<>');
  });

});