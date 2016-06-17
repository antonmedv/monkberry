describe('Directive', function () {
  var root;

  beforeEach(function () {
    jasmine.addMatchers(customMatchers);
    root = document.createElement('div');
  });

  it('should be trimed from html', function () {
    var view = Monkberry.render(DirectiveExample, root);
    expect(view).toBe('<div></div><div></div><div></div>');
  });

  it('should be bind, update, unbind', function () {
    var directives = {
      one: function () {
        this.bind = function (node) {
        };
        this.update = function (node) {
        };
        this.unbind = function (node) {
        };
      }
    };

    //var view = Monkberry.render(DirectiveOne, root, {directives: directives});
  });
});