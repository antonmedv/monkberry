window.require = function (path) {
  if (path == 'upper-case')
    return {
      default: function (text) {
        return text.toUpperCase();
      }
    };

  else
    return {};
};
