describe('Monkberry', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should render simple DOM', function () {
    var view = Monkberry.render(SimpleDom, root);
    expect(view).toBe('<div> Monkberry Moon Delight </div>');
  });


  it('should insert variable as text node', function () {
    var view = Monkberry.render(TextNode, root);
    view.update({
      text: 'To understand what recursion is, you must first understand recursion.'
    });
    expect(view).toBe('<p>To understand what recursion is, you must first understand recursion.</p>');
  });

  it('should insert variable in attributes', function () {
    var view = Monkberry.render(AttributeVariable, root);
    view.update({
      value: 'Value'
    });

    expect(view.nodes[0].value).toEqual('Value');
  });

  it('should properly work with text constants in text nodes', function () {
    var view = Monkberry.render(TextNodeAround, root);
    view.update({
      bar: 'bar'
    });
    expect(view).toBeLike('<p>foo bar baz</p>');
  });

  it('should properly work with text constants in attributes', function () {
    var view = Monkberry.render(AttributeVariableAround, root);
    view.update({
      bar: 'bar'
    });
    expect(view).toBe('<div class="foo bar baz"></div>');
  });

  it('should save value for variables in complex cases', function () {
    var view = Monkberry.render(ComplexSpotWithTwoVariables, root);

    view.update({
      foo: 'first',
      bar: 'second'
    });
    expect(view).toBe('<div class="first second"></div>');

    view.update({
      foo: 'updated'
    });

    expect(view).toBe('<div class="updated second"></div>');
  });

  it('should properly work with more then one node on topmost level', function () {
    var view = Monkberry.render(TwoTopLevelNodes, root);
    expect(view).toBe('<p>first</p><p>second</p>');
  });

  it('should optimize "if"/"for" tag, if it is only child', function () {
    var view = Monkberry.render(CommonIf, root);
    view.update({a: true, b: [1]});
    expect(view).toBe('<div><p>a</p><p>b</p></div>');
  });

  it('should place placeholders for multiply "if" tags', function () {
    var view = Monkberry.render(CommonIfWithPlaceholders, root);
    expect(view).toBe('<div><!--if--><!--if--></div>');
  });

  it('should place placeholders for multiply "if" and "for" tags', function () {
    var view = Monkberry.render(CommonInFor, root);
    expect(view).toBe('<div><!--if--><!--for--></div>');
  });

  it('should properly for with filters', function () {
    var filters = {
      append: function (value, text) {
        return value + text;
      },
      upperCase: function (value) {
        return value.toUpperCase();
      }
    };

    var view = Monkberry.render(CommonFilters, root, {filters: filters});

    view.update({text: 'upper_'});
    expect(view).toBe('<p>UPPER_CASE</p>');
  });

  it('should work with expressions', function () {
    var view = Monkberry.render(CommonExpressions, root);
    view.update({
      a: 1,
      b: 2,
      c: 100,
      d: 2,
      more: {
        amazing: 'a'
      },
      features: ['b', 'c']
    });
    expect(view).toBe('<a title="150">abc</a>');

    view.update({more: {amazing: 'Amazing!'}});

    expect(view).toBe('<a title="150">Amazing!bc</a>');
  });

  it('should render empty attributes', function () {
    var view = Monkberry.render(EmptyAttr, root);

    expect(view).toBe('<input type="checkbox" value="">');
    expect(view.nodes[0].checked).toEqual(true);
  });

  it('should render attributes without quotes', function () {
    var view = Monkberry.render(AttrWithoutQuotes, root);
    view.update({name: 'name'});

    expect(view).toBe('<div class="name"></div>');
  });

  it('should work querySelector', function () {
    var view = Monkberry.render(Query, root);

    expect(view.querySelector('.foo').getAttribute('id')).toEqual('one');
    expect(view.querySelector('.boo').getAttribute('id')).toEqual('two');
    expect(view.querySelector('.baz').getAttribute('id')).toEqual('three');
  });

  it('should support global variables', function () {
    var view = Monkberry.render(Globals, root);
    view.update({host: window.location.host});

    expect(view).toBeLike('<i>expr, if<!--if-->, for<!--for-->, <i class="attr"></i>, custom<!--GlobalsCustom--></i>');
  });

  it('should support expressions without variables', function () {
    var view = Monkberry.render(EmptyExpression, root);
    expect(view).toBe('7');
  });

  it('should insert default values on render', function () {
    var view = Monkberry.render(DefaultValue, root);
    expect(view).toBe('<div class="default">empty</div>');

    view.update({
      id: null,
      foo: 'foo',
      boo: 'boo',
      content: 'content'
    });
    expect(view).toBe('<div class="boo" id="foo">content</div>');
  });

  it('should ignore all html comments', function () {
    var view = Monkberry.render(Comment, root);
    expect(view).toBe('<span>Moon</span>');
  });

  it('should replace HTML entities with Unicode symbols', function () {
    var view = Monkberry.render(HtmlEntity, root);
    expect(view).toBe(' "&amp;\'&lt;&gt;©£±¶ — € ♥&amp;notExists; ');
  });

  it('should be able prerender templates', function () {
    Monkberry.prerender(TextNode, 10);

    var view = Monkberry.render(TextNode, root);
    view.update({text: 'text'});
    expect(view).toBe('<p>text</p>');
  });
});
