describe('Lifecycle', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  afterEach(function () {
    root = void 0;
  });

  it("calls the beforeRender() function before rendering", function() {
    SimpleDom.prototype.beforeRender = jasmine.createSpy("beforeRenderSpy");
    var view = Monkberry.render(SimpleDom, root);
    expect(view.beforeRender).toHaveBeenCalled();
  });

  it("calls the afterRender() function after rendering", function() {
    SimpleDom.prototype.afterRender = jasmine.createSpy("afterRenderSpy");
    var view = Monkberry.render(SimpleDom, root);
    expect(view.afterRender).toHaveBeenCalled();
  });

  it("calls the beforeUpdate() function before updating", function() {
    var view = Monkberry.render(SimpleDom, root);
    var data = {foo: 'bar'};
    spyOn(view, 'beforeUpdate');
    view.update(data);
    expect(view.beforeUpdate).toHaveBeenCalledWith(data);
  });

  it("calls the afterUpdate() function after updating", function() {
    var view = Monkberry.render(SimpleDom, root);
    var data = {foo: 'bar'};
    spyOn(view, 'afterUpdate');
    view.update(data);
    expect(view.afterUpdate).toHaveBeenCalledWith(data);
  });

  it("calls the beforeRemove() function before removing", function() {
    var view = Monkberry.render(SimpleDom, root);
    spyOn(view, 'beforeRemove');
    view.remove();
    expect(view.beforeRemove).toHaveBeenCalled();
  });

  it("calls the afterRemove() function after removing", function() {
    var view = Monkberry.render(SimpleDom, root);
    spyOn(view, 'afterRemove');
    view.remove();
    expect(view.afterRemove).toHaveBeenCalled();
  });
});
