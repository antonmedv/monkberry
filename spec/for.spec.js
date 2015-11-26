describe('For tags', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should render arrays', function () {
    var view = monkberry.render('For');

    view.update({list: [1, 2, 3]});
    expect(view).toBeLike('<ul><li>0:1</li><li>1:2</li><li>2:3</li></ul>');

    view.update({list: [1, 3]});
    expect(view).toBeLike('<ul><li>0:1</li><li>1:3</li></ul>');

    view.update({list: ['a', 'b', 'c', 'd']});
    expect(view).toBeLike('<ul><li>0:a</li><li>1:b</li><li>2:c</li><li>3:d</li></ul>');
  });

  it('should render arrays with externals', function () {
    var view = monkberry.render('ForA');

    view.update({list: [1, 2, 3], ext: '.js'});
    expect(view).toBeLike('<div><p>1.js</p><p>2.js</p><p>3.js</p></div>');
  });

  it('should iterate over objects', function () {
    var view = monkberry.render('ForObject');

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
    var view = monkberry.render('ForObjectWithoutOptions');

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
    var view = monkberry.render('ForObjectWithoutOptions');

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
    var view = monkberry.render('ForWithCustomTag');

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

});