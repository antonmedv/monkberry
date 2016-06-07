describe('Custom tags', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should properly work with attributes', function () {
    var view = Monkberry.render(CustomAttributes, root);
    view.update({
      value: 'title',
      text: 'content'
    });
    expect(view).toBe('<div><h1>string</h1><div>text</div><!--CustomPanel--><h1>title</h1><div>content</div><!--CustomPanel--></div>');

    view.update({value: 'updated'});
    expect(view).toBe('<div><h1>string</h1><div>text</div><!--CustomPanel--><h1>updated</h1><div>content</div><!--CustomPanel--></div>');
  });

  it('should render inline', function () {
    var view = Monkberry.render(CustomInline, root);
    expect(view).toBe('<div><p>inline</p><!--custom-inline--><p>inline</p><!--custom-inline--></div>');
  });

});