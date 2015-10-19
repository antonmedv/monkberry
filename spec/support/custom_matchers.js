window.customMatchers = {
  toBe: function () {
    return {
      compare: function (view, html) {
        var a = document.createElement('div'), b = document.createElement('div'), result = {};

        view.appendTo(a);
        b.innerHTML = html;

        result.pass = a.isEqualNode(b);

        if (result.pass) {
          result.message = 'Expected "' + a.innerHTML + '" not to be equals "' + b.innerHTML + '".';
        } else {
          result.message = 'Expected "' + a.innerHTML + '" to be equals "' + b.innerHTML + '".';
        }

        return result;
      }
    };
  },
  toBeLike: function () {
    return {
      compare: function (view, html) {
        var a = document.createElement('div'), b = document.createElement('div'), result = {};

        view.appendTo(a);
        b.innerHTML = html;

        result.pass = a.toString() == b.toString();

        if (result.pass) {
          result.message = 'Expected "' + a.toString() + '" not to be equals "' + b.toString() + '".';
        } else {
          result.message = 'Expected "' + a.toString() + '" to be equals "' + b.toString() + '".';
        }

        return result;
      }
    };
  }
};
