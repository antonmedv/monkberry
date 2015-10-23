describe('Custom tags', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should properly work', function () {
    var view = monkberry.render('Custom', {
      value: 'title',
      text: 'content'
    });
    expect(view).toBe('<div><h1>string</h1><div>text</div><!--panel--><h1>title</h1><div>content</div><!--panel--></div>');

    view.update({value: 'updated'});
    expect(view).toBe('<div><h1>string</h1><div>text</div><!--panel--><h1>updated</h1><div>content</div><!--panel--></div>');
  });

  it('should render inline', function () {
    var view = monkberry.render('CustomInline', {});
    expect(view).toBe('<div><p>inline</p><!--custom-inline--><p>inline</p><!--custom-inline--></div>');
  });

});