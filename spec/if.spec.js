describe('If tags', function () {
  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
  });

  it('should properly work', function () {
    var view = monkberry.render('If', {test: true, context: 'parent data'});
    expect(view).toBeLike('<div>true: parent data</div>');

    view.update({test: false});
    expect(view).toBeLike('<div></div>');

    view.update({test: true});
    expect(view).toBeLike('<div>true: parent data</div>');

    view = monkberry.render('IfElse', {test: true});
    expect(view).toBeLike('<div> then </div>');

    view.update({test: false});
    expect(view).toBeLike('<div> else </div>');
  });

  it('should work with expression', function () {
    var view = monkberry.render('IfExpr', {
      array: [1, 2, 3, 4, 5],
      look: 3,
      indep: 'independent'
    });
    expect(view).toBe('<div> (one) <!--if-->3<p>independent</p><!--if--></div>');

    view.update({look: 2});
    expect(view).toBe('<div> (one) <!--if-->2<p>independent</p><!--if--></div>');
  });

  it('should update only one view', function () {
    var view = monkberry.render('IfUpdate', {
      test: true,
      value: 'old'
    });
    expect(view).toBe('<div>old</div>');

    view.update({test: false, value: 'new'});
    expect(view).toBe('<div></div>');

    view.update({test: true});
    // Important! It's looks like here must be new value, but this is not correct because then if does not passes,
    // view of this if will not updated and still contains old values.
    expect(view).toBe('<div>old</div>');

    view.update({test: true, value: 'new'});
    // To update if's view, give that values.
    expect(view).toBe('<div>new</div>');

  });

});