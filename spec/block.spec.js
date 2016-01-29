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

  it('should be optimized when inside if tag', function () {
    var view = monkberry.render('OptimizeNestedBlockInIf', {cond: true});
    expect(view).toBe('<div> true </div>');

    view.update({cond: false});
    expect(view).toBe('<div> false </div>');

    expect(monkberry.templates['OptimizeNestedBlockInIf.then']).toBeDefined();
    expect(monkberry.templates['OptimizeNestedBlockInIf.otherwise']).toBeDefined();
    expect(monkberry.templates['OptimizeNestedBlockInIf.if0']).not.toBeDefined();
    expect(monkberry.templates['OptimizeNestedBlockInIf.if0.else']).not.toBeDefined();
  });

});