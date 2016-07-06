window.require = function (path) {
  if (path == 'upper-case')
    return {
      __esModule: true,
      default: function (text) {
        return text.toUpperCase();
      }
    };

  else
    return {};
};
