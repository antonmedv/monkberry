describe('Spread attributes', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should work for html elements', function () {
    var view = Monkberry.render(SpreadElementAttributes, root);
    view.update({
      attr: {
        id: 'id',
        'data-attr': 'data',
        'class': 'foo'
      }
    });
    expect(view).toBe('<div id="id" data-attr="data" class="foo"></div>');
  });

  it('should override default attributes', function () {
    var view = Monkberry.render(SpreadAttributesOverride, root);
    expect(view).toBe('<div id="foo"></div>');

    view.update({
      attr: {
        id: 'boo'
      }
    });
    expect(view).toBe('<div id="boo"></div>');
  });

  it('should override variables attributes', function () {
    var view = Monkberry.render(SpreadAttributesWithVar, root);
    view.update({id: "foo"});
    expect(view).toBe('<div id="foo"></div>');

    view.update({
      attr: {
        id: 'boo'
      }
    });
    expect(view).toBe('<div id="boo"></div>');

    view.update({id: "bar"});
    expect(view).toBe('<div id="bar"></div>');
  });


  it('should work for custom tags', function () {
    var view = Monkberry.render(SpreadCustomAttributes, root);

    view.update({
      attr: {
        foo: 'foo',
        boo: 'boo',
        bar: 'bar'
      }
    });
    expect(view).toBe('<div><i>foo</i><i>boo</i><i>bar</i></div>');

    view.update({
      attr: {
        boo: 'Boo-Ya'
      }
    });
    expect(view).toBe('<div><i>foo</i><i>Boo-Ya</i><i>bar</i></div>');
  });

  it('should work for custom tags with constant attributes values', function () {
    var view = Monkberry.render(SpreadCustomAttributesWithConst, root);
    expect(view).toBeLike('<div><i>foo</i><i></i><i></i></div>');

    view.update({
      attr: {
        boo: 'boo',
        bar: 'bar'
      }
    });
    expect(view).toBe('<div><i>foo</i><i>boo</i><i>bar</i></div>');

    view.update({
      attr: {
        foo: 'over foo'
      }
    });
    expect(view).toBe('<div><i>over foo</i><i>boo</i><i>bar</i></div>');
  });

  it('should work for custom tags with attributes with values', function () {
    var view = Monkberry.render(SpreadCustomAttributesWithVar, root);
    expect(view).toBeLike('<div></div>');

    view.update({
      attr: {
        boo: 'boo',
        bar: 'bar'
      }
    });
    expect(view).toBeLike('<div><i></i><i>boo</i><i>bar</i></div>');

    view.update({
      foo: 'foo'
    });
    expect(view).toBe('<div><i>foo</i><i>boo</i><i>bar</i></div>');

    view.update({
      attr: {
        foo: 'over foo'
      }
    });
    expect(view).toBe('<div><i>over foo</i><i>boo</i><i>bar</i></div>');
  });

});