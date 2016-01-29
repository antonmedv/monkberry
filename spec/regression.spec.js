describe('Regression', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
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

  it('should work with first level non-elements', function () {
    var view = monkberry.render('FirstLevelStatements');
    var node = document.createElement('div');
    view.appendTo(node);
    view.update({
      cond: true,
      loop: [1, 2, 3],
      tag: true,
      xss: 'ok'
    });
    expect(node).toDOM(' text <div class="if">ok</div><!--if--><div class="for">ok</div><div class="for">ok</div><div class="for">ok</div><!--for--><div class="custom">ok</div><!--first-level-tag--><i class="unsafe">ok</i><!--unsafe-->');
  });

  it('should throw exception if user try to use querySelector on first level non-elements', function () {
    var view = monkberry.render('FirstLevelStatements');
    var node = document.createElement('div');
    view.appendTo(node);
    view.update({
      cond: true,
      loop: [1, 2, 3],
      tag: true,
      xss: 'ok'
    });

    expect(function () {
      view.querySelector('.if');
    }).toThrow('Can not use querySelector with non-element nodes on first level.');
  });


  it('if with custom tag', function () {
    var view = monkberry.render('ReIfCustom', {test: true});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--></div>');

    view.update({test: false});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--></div>');
  });

  it('if with block tag', function () {
    var view = monkberry.render('ReIfBlock', {test: true});
    expect(view).toBe('<div><i>1</i><!--block--><i>2</i><!--block--></div>');

    view.update({test: false});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    expect(view).toBe('<div><i>1</i><!--block--><i>2</i><!--block--></div>');
  });

  it('if with unsafe tag', function () {
    var view = monkberry.render('ReIfUnsafe', {test: true});
    expect(view).toBe('<div><div><i>unsafe</i></div></div>');

    view.update({test: false});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    expect(view).toBe('<div><div><i>unsafe</i></div></div>');
  });

  it('if with custom tag', function () {
    var view = monkberry.render('ReForCustom', {array: [1,2,3]});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>');

    view.update({array: []});
    expect(view).toBe('<div></div>');

    view.update({array: [1,3]});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>');
  });

  it('if with block tag', function () {
    var view = monkberry.render('ReForBlock', {array: [1,2,3]});
    expect(view).toBe('<div><i>1</i><!--block--><i>2</i><!--block--><i>1</i><!--block--><i>2</i><!--block--><i>1</i><!--block--><i>2</i><!--block--></div>');

    view.update({array: []});
    expect(view).toBe('<div></div>');

    view.update({array: [1,3]});
    expect(view).toBe('<div><i>1</i><!--block--><i>2</i><!--block--><i>1</i><!--block--><i>2</i><!--block--></div>');
  });

});
