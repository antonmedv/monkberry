describe('Directive', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should be trimmed from html', function () {
    function directiveMock() {
      return function () {
        this.bind = function (node) {
        };
        this.update = function (node) {
        };
        this.unbind = function (node) {
        };
      };
    }

    var directives = {
      fade: directiveMock(),
      show: directiveMock(),
      content: directiveMock()
    };

    var view = Monkberry.render(DirectiveExample, root, {directives: directives});

    expect(view).toBe('<div></div><div></div><div></div>');
  });

  it('methods bind, update, unbind should be called', function () {
    var directive = function () {};
    directive.prototype.bind = function (value) {};
    directive.prototype.update = function (value) {};
    directive.prototype.unbind = function (value) {};

    spyOn(directive.prototype, 'bind');
    spyOn(directive.prototype, 'update');
    spyOn(directive.prototype, 'unbind');

    var directives = {
      directive: directive
    };
    var options = {
      directives: directives
    };

    var view = Monkberry.render(DirectiveOne, root, options);
    view.update({value: true});
    view.remove();

    expect(directive.prototype.bind).toHaveBeenCalledWith(view.nodes[0]);
    expect(directive.prototype.update).toHaveBeenCalledWith(true);
    expect(directive.prototype.unbind).toHaveBeenCalledWith(view.nodes[0]);
  });
});