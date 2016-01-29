describe('Monkberry', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should render simple DOM', function () {
    var view = monkberry.render('monkberry');
    expect(view).toBe('<div> Monkberry Moon Delight </div>');
  });


  it('should insert variable as text node', function () {
    var view = monkberry.render('test1');
    view.update({
      text: 'To understand what recursion is, you must first understand recursion.'
    });
    expect(view).toBe('<p>To understand what recursion is, you must first understand recursion.</p>');
  });

  it('should insert variable in attributes', function () {
    var view = monkberry.render('test2');
    view.update({
      value: 'Value'
    });

    expect(view.nodes[0].value).toEqual('Value');
  });

  it('should properly work with text constants in text nodes', function () {
    var view = monkberry.render('test3');
    view.update({
      bar: 'bar'
    });
    expect(view).toBeLike('<p>foo bar baz</p>');
  });

  it('should properly work with text constants in attributes', function () {
    var view = monkberry.render('test4');
    view.update({
      bar: 'bar'
    });
    expect(view).toBe('<div class="foo bar baz"></div>');
  });

  it('should save value for variables in complex cases', function () {
    var view = monkberry.render('test5');

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
    var view = monkberry.render('test7');
    expect(view).toBe('<p>first</p><p>second</p>');
  });

  it('should optimize "if"/"for" tag, if it is only child', function () {
    var view = monkberry.render('test10', {a: true, b: [1]});
    expect(view).toBe('<div><p>a</p><p>b</p></div>');
  });

  it('should place placeholders for multiply "if" tags', function () {
    var view = monkberry.render('test11');
    expect(view).toBe('<div><!--if--><!--if--></div>');
  });

  it('should place placeholders for multiply "if" and "for" tags', function () {
    var view = monkberry.render('test12');
    expect(view).toBe('<div><!--if--><!--for--></div>');
  });

  it('should properly for with filters', function () {
    monkberry.filters.append = function (value, text) {
      return value + text;
    };
    monkberry.filters.upperCase = function (value) {
      return value.toUpperCase();
    };

    var view = monkberry.render('test-filters', {text: 'upper_'});
    expect(view).toBe('<p>UPPER_CASE</p>');
  });

  it('should work with expressions', function () {
    var view = monkberry.render('test-expressions', {
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
    var view = monkberry.render('EmptyAttr');

    expect(view).toBe('<input type="checkbox" value="">');
    expect(view.nodes[0].checked).toEqual(true);
  });

  it('should render attributes without quotes', function () {
    var view = monkberry.render('AttrWithoutQuotes', {name: 'name'});

    expect(view).toBe('<div class="name"></div>');
  });

  it('should work querySelector', function () {
    var view = monkberry.render('Query');
    view.appendTo(document.body);

    expect(view.querySelector('.foo').getAttribute('id')).toEqual('one');
    expect(view.querySelector('.boo').getAttribute('id')).toEqual('two');
    expect(view.querySelector('.baz').getAttribute('id')).toEqual('three');
  });

  it('should work getElementById', function () {
    var view = monkberry.render('Query');

    expect(view.getElementById('one').getAttribute('id')).toEqual('one');
    expect(view.getElementById('two').getAttribute('id')).toEqual('two');
    expect(view.getElementById('three').getAttribute('id')).toEqual('three');
  });

  it('should support global variables', function () {
    var view = monkberry.render('Globals', {host: window.location.host});

    expect(view).toBeLike('<i>expr, if<!--if-->, for<!--for-->, <i class="attr"></i>, custom<!--custom--></i>');
  });

  it('should support expressions without variables', function () {
    var view = monkberry.render('EmptyExpression');
    expect(view).toBe('7');
  });

  it('should insert default values on render', function () {
    var view = monkberry.render('DefaultValue');
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
    var view = monkberry.render('Comment');
    expect(view).toBe('<span>Moon</span>');
  });

  it('should replace HTML entities with Unicode symbols', function () {
    var view = monkberry.render('HtmlEntity');
    expect(view).toBe(' "&amp;\'&lt;&gt;©£±¶ — € ♥&amp;notExists; ');
  });

  it('should create new Monkberry with createPool', function () {
    var p1 = monkberry.createPool();
    var p2 = monkberry.createPool();

    monkberry.filters.upperCase = function (value) {
      return value.toUpperCase();
    };

    p1.mount(function (m, d) {
      return {
        template: function () {
          // Create elements
          var div0 = d.createElement('div');

          // Construct dom
          div0.textContent = m.filters.upperCase('template 1');

          // Create view
          var view = m.view();

          // Set root nodes
          view.nodes = [div0];
          return view;
        }
      };
    });

    p2.mount(function (m, d) {
      return {
        template: function () {
          // Create elements
          var div0 = d.createElement('div');

          // Construct dom
          div0.textContent = m.filters.upperCase('template 2');

          // Create view
          var view = m.view();

          // Set root nodes
          view.nodes = [div0];
          return view;
        }
      };
    });

    p1.prerender('template');
    var view1 = p1.render('template');
    p2.prerender('template');
    var view2 = p2.render('template');

    expect(view1).toBe('<div>TEMPLATE 1</div');
    expect(view2).toBe('<div>TEMPLATE 2</div>');
  });

});
