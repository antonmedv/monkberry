describe('For tags', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should render arrays', function () {
    var view = Monkberry.render(Loop, root);
    view.update({list: [1, 2, 3]});
    expect(view).toBeLike('<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>');

    view.update({list: [1, 3]});
    expect(view).toBeLike('<ul><li>0:1</li><li>1:3</li></ul>');

    view.update({list: ['a', 'b', 'c', 'd']});
    expect(view).toBeLike('<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>');
  });

  it('should render arrays with externals', function () {
    var view = Monkberry.render(LoopA, root);
    view.update({list: [1, 2, 3], ext: '.js'});
    expect(view).toBeLike('<div><p>1.js</p><p>2.js</p><p>3.js</p></div>');
  });

  it('should iterate over objects', function () {
    var view = Monkberry.render(LoopObject, root);

    view.update({
      obj: {
        a: 1,
        b: 2,
        c: 3
      }
    });
    expect(view).toBeLike('<div>a: 1; b: 2; c: 3; </div>');

    view.update({
      obj: {
        a: 1,
        c: 3,
        d: 4
      }
    });
    expect(view).toBeLike('<div>a: 1; c: 3; d: 4; </div>');
  });

  it('should iterate over arrays without options', function () {
    var view = Monkberry.render(LoopObjectWithoutOptions, root);

    view.update({
      obj: [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'}
      ]
    });
    expect(view).toBeLike('<div>a; b; c; </div>');
  });


  it('should iterate over objects without options', function () {
    var view = Monkberry.render(LoopObjectWithoutOptions, root);

    view.update({
      obj: {
        a: {name: 'a'},
        b: {name: 'b'},
        c: {name: 'c'}
      }
    });
    expect(view).toBeLike('<div>a; b; c; </div>');
  });

  it('should delete old items from childred map with custom tag', function () {
    var view = Monkberry.render(LoopWithCustomTag, root);

    view.update({
      list: [
        {
          id: 1,
          value: 'a'
        },
        {
          id: 2,
          value: 'b'
        },
        {
          id: 3,
          value: 'c'
        }
      ]
    });
    expect(view).toBe('<div><ul><li>1:a</li><!--MyLi--><li>2:b</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>');

    view.update({
      list: [
        {
          id: 1,
          value: 'a'
        },
        {
          id: 3,
          value: 'c'
        }
      ]
    });
    expect(view).toBe('<div><ul><li>1:a</li><!--MyLi--><li>3:c</li><!--MyLi--></ul></div>');
  });

  it('should not expose local variables', function () {
    var view = Monkberry.render(LoopLocaleVariableExpose, root);

    view.update({
      as: ['a', 'b'],
      bs: [1, 2],
      b: 'GLOBAL'
    });
    expect(view).toBeLike('<section><i><b>1</b><b>2</b></i><i><b>1</b><b>2</b></i></section>');
  });

});