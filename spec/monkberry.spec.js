describe('Monkberry', function () {
  beforeEach(function() {
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

    expect(view.querySelector('input').value).toEqual('Value');
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

  it('should update all values', function () {
    var view = monkberry.render('test-parent-values', {
      value: 1,
      on: true,
      each: [1, 2, 3]
    });
    expect(view).toBeLike('<p>1</p><p>1</p><p>111</p>');

    view.update({value: 2});
    expect(view).toBeLike('<p>2</p><p>2</p><p>222</p>');

    // Complex:

    view = monkberry.render('test-parent-values-complex', {
      a: 2,
      b: 3,
      on: true,
      each: [1, 2]
    });
    expect(view).toBeLike('<p>5</p><p>-1</p><p>66</p>');

    view.update({a: 4});
    expect(view).toBeLike('<p>7</p><p>1</p><p>1212</p>');

    view.update({b: 1});
    expect(view).toBeLike('<p>5</p><p>3</p><p>44</p>');

    view.update({a: 2, b: 2});
    expect(view).toBeLike('<p>4</p><p>0</p><p>44</p>');
  });

  it('should update variables in nested views', function () {
    var view = monkberry.render('test-nested-views', {
      value: 1,
      on: true,
      each: [1, 2, 3]
    });
    expect(view).toBe('<p>1<!--if-->1<!--if-->1<!--if--></p>');

    view.update({value: 7});
    expect(view).toBe('<p>7<!--if-->7<!--if-->7<!--if--></p>');
  });

  it('should render empty attributes', function () {
    var view = monkberry.render('EmptyAttr');

    expect(view).toBe('<input type="checkbox" value="">');
    expect(view.querySelector('input').checked).toEqual(true);
  });
});
