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

        result.pass = a.innerHTML == b.innerHTML;

        if (result.pass) {
          result.message = 'Expected "' + a.innerHTML + '" not to be equals "' + b.innerHTML + '".';
        } else {
          result.message = 'Expected "' + a.innerHTML + '" to be equals "' + b.innerHTML + '".';
        }

        return result;
      }
    };
  },
  toDOM: function () {
    return {
      compare: function (dom, html) {
        var a = dom, b = document.createElement('div'), result = {};

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
  }
};
