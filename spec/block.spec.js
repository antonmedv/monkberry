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

    expect(monkberry.templates['then']).toBeDefined();
    expect(monkberry.templates['otherwise']).toBeDefined();
    expect(monkberry.templates['OptimizeNestedBlockInIf.if0']).not.toBeDefined();
    expect(monkberry.templates['OptimizeNestedBlockInIf.if0.else']).not.toBeDefined();
  });

  it('should give correct figure names', function () {
    var view = monkberry.render('BlockWithProperNames', {array: [{cond: true}], cond: false});
    expect(view).toBeLike('<div> 1 <!--block--> 2  3 <!--if--><!--for--> 5 <!--if--><!--if--></div>');
    expect(monkberry.templates['BlockWithProperNames.1']).toBeDefined();
    expect(monkberry.templates['BlockWithProperNames.2']).toBeDefined();
    expect(monkberry.templates['BlockWithProperNames.3']).toBeDefined();
    expect(monkberry.templates['BlockWithProperNames.4']).toBeDefined();
    expect(monkberry.templates['BlockWithProperNames.5']).toBeDefined();
  });

});