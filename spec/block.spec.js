describe('Block tags', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should properly work', function () {
    var view = monkberry.render('Block', {foo: 'data for block'});
    expect(view).toBe('<div><i>data for block</i></div>');

    view.update({foo: 'update'});
    expect(view).toBe('<div><i>update</i></div>');
  });

  it('should properly work with two blocks', function () {
    var view = monkberry.render('TwoBlocks');
    expect(view).toBeLike('<div><i></i><!--block--><i></i><!--block--></div>');

    view.update({foo: 'data'});
    expect(view).toBe('<div><i>data</i><!--block--><i>data</i><!--block--></div>');
  });

});