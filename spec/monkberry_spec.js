describe('Monkberry', function () {
  beforeEach(function() {
    jasmine.addCustomEqualityTester(function (view, html) {
      var a, b, node = document.createElement('div');
      node.innerHTML = html;
      a = view.dom();
      b = node.childNodes[0];
      return a.isEqualNode(b);
    });
  });

  it('should render simple DOM', function () {
    var view = monkberry.render('monkberry');
    expect(view).toEqual('<div> Monkberry Moon Delight </div>');
  });


  it('should insert variable as text node', function () {
    var view = monkberry.render('test1');
    view.update({
      text: 'To understand what recursion is, you must first understand recursion.'
    });
    expect(view).toEqual('<p>To understand what recursion is, you must first understand recursion.</p>');
  });

  it('should insert variable in attributes', function () {
    var view = monkberry.render('test2');
    view.update({
      value: 'Value'
    });

    expect(view).toEqual('<input type="text" value="Value">');
  });

  it('should properly work with text constants in text nodes', function () {
    var view = monkberry.render('test3');
    view.update({
      bar: 'bar'
    });
    expect(view).toEqual('<p>foo bar baz</p>');
  });

  it('should properly work with text constants in attributes', function () {
    var view = monkberry.render('test4');
    view.update({
      bar: 'bar'
    });
    expect(view).toEqual('<div class="foo bar baz"></div>');
  });

  it('should save value for variables in complex cases', function () {
    var view = monkberry.render('test5');

    view.update({
      foo: 'first',
      bar: 'second'
    });
    expect(view).toEqual('<div class="first second"></div>');

    view.update({
      foo: 'updated'
    });

    expect(view).toEqual('<div class="updated second"></div>');
  });

  it('should render arrays', function () {
    var view = monkberry.render('test6');
    view.update({
      list: [1, 2, 3]
    });
    expect(view).toEqual('<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>');
  });

});
