function unique(a) {
  return a.reduce(function (p, c) {
    if (p.indexOf(c) < 0) {
      p.push(c);
    }
    return p;
  }, []);
}

module.exports = function (params) {
  return unique(params).sort().join('_');
};
