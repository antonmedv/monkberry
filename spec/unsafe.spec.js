describe('Unsafe', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should insert constants as HTML', function () {
    var view = Monkberry.render(UnsafeWithConstant, root);
    expect(view).toBe('<div><br></div>');
  });

  it('should insert variables as HTML', function () {
    var view = Monkberry.render(UnsafeWithVariables, root);
    expect(view).toBe('<div></div>');

    view.update({html: '<a href="javascript:XSS;">Link</a>'});
    expect(view).toBe('<div><a href="javascript:XSS;">Link</a></div>');
  });

  it('should remove old DOM nodes and insert new', function () {
    var view = Monkberry.render(UnsafeWithVariables, root);
    view.update({html: '<div>foo</div><br>'});
    expect(view).toBe('<div><div>foo</div><br></div>');

    view.update({html: '<input type="datetime"><hr><div>baz</div>'});
    expect(view).toBe('<div><input type="datetime"><hr><div>baz</div></div>');

    view.update({html: ''});
    expect(view).toBe('<div></div>');

    view.update({html: '<!-- comment -->'});
    expect(view).toBe('<div><!-- comment --></div>');
  });

  it('should insert unsafe with placeholders', function () {
    var view = Monkberry.render(UnsafeWithPlaceholder, root);
    view.update({html: '<hr>'});
    expect(view).toBe('<div><br><!--unsafe--><hr><!--unsafe--></div>');

    view.update({html: '<br><!-- comment --><link href="http://monkberry.js.org">'});
    expect(view).toBe('<div><br><!--unsafe--><br><!-- comment --><link href="http://monkberry.js.org"><!--unsafe--></div>');
  });
});