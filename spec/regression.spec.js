describe('Regression', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should update all values', function () {
    var view = Monkberry.render(RegressionParentValues, root);
    view.update({
      value: 1,
      on: true,
      each: [1, 2, 3]
    });
    expect(view).toBeLike('<p>1</p><p>1</p><p>111</p>');

    view.update({value: 2});
    expect(view).toBeLike('<p>2</p><p>2</p><p>222</p>');

    // Complex:

    view = Monkberry.render(RegressionParentValuesComplex, root);
    view.update({
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
    var view = Monkberry.render(RegressionNestedViews, root);
    view.update({
      value: 1,
      on: true,
      each: [1, 2, 3]
    });
    expect(view).toBe('<p>1<!--if-->1<!--if-->1<!--if--></p>');

    view.update({value: 7});
    expect(view).toBe('<p>7<!--if-->7<!--if-->7<!--if--></p>');
  });

  it('should work with first level non-elements', function () {
    var view = Monkberry.render(FirstLevelStatements, root);
    view.update({
      cond: true,
      loop: [1, 2, 3],
      tag: true,
      xss: 'ok'
    });
    expect(root).toDOM(' text <div class="if">ok</div><!--if--><div class="for">ok</div><div class="for">ok</div><div class="for">ok</div><!--for--><div class="custom">ok</div><!--first-level-tag--><i class="unsafe">ok</i><!--unsafe-->');
  });

  it('should throw exception if user try to use querySelector on first level non-elements', function () {
    var view = Monkberry.render(FirstLevelStatements, root);
    view.update({
      cond: true,
      loop: [1, 2, 3],
      tag: true,
      xss: 'ok'
    });

    expect(function () {
      view.querySelector('.if');
    }).toThrow(new Error('Can not use querySelector with non-element nodes on first level.'));
  });


  it('if with custom tag', function () {
    var view = Monkberry.render(ReIfCustom, root);
    view.update({test: true});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--></div>');

    view.update({test: false});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--></div>');
  });

  it('if with unsafe tag', function () {
    var view = Monkberry.render(ReIfUnsafe, root);
    view.update({test: true});
    expect(view).toBe('<div><div><i>unsafe</i></div></div>');

    view.update({test: false});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    expect(view).toBe('<div><div><i>unsafe</i></div></div>');
  });

  it('if with custom tag', function () {
    var view = Monkberry.render(ReForCustom, root);
    view.update({array: [1,2,3]});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>');

    view.update({array: []});
    expect(view).toBe('<div></div>');

    view.update({array: [1,3]});
    expect(view).toBe('<div><div> Custom tag </div><!--Tag--><div> Custom tag </div><!--Tag--></div>');
  });

  it('update loops in custom tags', function () {
    var view = Monkberry.render(UpdateLoopsInCustomTags, root);
    view.update({
      foo: 'foo',
      bar: 'bar',
      list: [1, 2, 3]
    });
    expect(view).toBe('<i><em><b class="foobar">1</b><b class="foobar">2</b><b class="foobar">3</b></em></i>');
  });

  it('should not update variables what exists only in inner scope', function () {
    var view = Monkberry.render(UpdateLocalVars, root);

    var data = {
      list: [[1], [2], [3]],
      t1: 'bug?'
    };
    view.update(data);

    expect(view).toBe('<p><i>1</i><!--for--><i>2</i><!--for--><i>3</i><!--for--><!--for--></p>');
  });

  it('should cache options variable data for loops', function () {
    var view = Monkberry.render(ReLoopOptionsCache, root);

    var data1 = {
      "currency": "USD",
      "locale": "en",
      "currencies": {"USD": {"name": "US dollar"}, "EUR": {"name": "Euro"}, "AUD": {"name": "Australian dollar"}}
    };

    view.update(data1);
    expect(view).toBe('<ul><li class="selected"><span>USD</span>: US dollar</li><!--if--><li><span>EUR</span>: Euro</li><!--if--><li><span>AUD</span>: Australian dollar</li><!--if--></ul>');
    
    
    var data2 = {
      "currency": "AUD",
      "locale": "en",
      "currencies": {"USD": {"name": "US dollar"}, "EUR": {"name": "Euro"}, "AUD": {"name": "Australian dollar"}}
    };
    
    view.update(data2);
    expect(view).toBe('<ul><li><span>USD</span>: US dollar</li><!--if--><li><span>EUR</span>: Euro</li><!--if--><li class="selected"><span>AUD</span>: Australian dollar</li><!--if--></ul>');
    
  });

});
