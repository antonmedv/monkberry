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

    expect(view).toBe('<input type="text" value="Value">');
  });

  it('should properly work with text constants in text nodes', function () {
    var view = monkberry.render('test3');
    view.update({
      bar: 'bar'
    });
    expect(view).toBe('<p>foo bar baz</p>');
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

  it('should render arrays', function () {
    var view = monkberry.render('test6');

    view.update({list: [1, 2, 3]});
    expect(view).toBe('<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>');

    view.update({list: [1, 3]});
    expect(view).toBe('<ul><li>0:1</li><li>1:3</li></ul>');

    view.update({list: ['a', 'b', 'c', 'd']});
    expect(view).toBe('<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>');
  });

  it('should correctly work with wrappers', function () {
    var items = [];
    monkberry.wrappers['test6.for0'] = function (view) {
      items.push(function () {
        view.remove();
      });
      return view;
    };

    var view = monkberry.render('test6');

    view.update({list: [1, 2, 3]});
    expect(view).toBe('<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>');

    items[1]();
    expect(view).toBe('<ul><li>0:1</li><li>2:3</li></ul>');
  });

  it('should properly work with more then one node on topmost level', function () {
    var view = monkberry.render('test7');
    expect(view).toBe('<p>first</p><p>second</p>');
  });

  it('should render custom tags', function () {
    var view = monkberry.render('test8', {text: 'for custom tags'});
    expect(view).toBe('<div><p>for custom tags</p></div>');
  });

  it('should render inline custom tags', function () {
    var view = monkberry.render('test9', {});
    expect(view).toBe('<div><p>inline</p><!--custom-inline--><p>inline</p><!--custom-inline--></div>');
  });

  it('should optimize <if>/<for> tag, if it is only child', function () {
    var view = monkberry.render('test10', {a: true, b: [1]});
    expect(view).toBe('<div><p>a</p><p>b</p></div>');
  });

  it('should place placeholders for multiply <if> tags', function () {
    var view = monkberry.render('test11');
    expect(view).toBe('<div><!--if--><!--if--></div>');
  });

  it('should place placeholders for multiply <if> and <for> tags', function () {
    var view = monkberry.render('test12');
    expect(view).toBe('<div><!--if--><!--for--></div>');
  });

  it('should properly for with <if> tags', function () {
    var view = monkberry.render('test-if', {test: true, context: 'parent data'});
    expect(view).toBe('<div> true: parent data </div>');

    view.update({test: false});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    expect(view).toBe('<div> true: parent data </div>');
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

});
