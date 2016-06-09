window.require = function (path) {
  if (path == 'upper-case')
    return function (text) {
      return text.toUpperCase();
    };
  else
    return {};
};
