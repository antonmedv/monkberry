var htmlparser = require('htmlparser2');
var Compiler = require('./compiler');

function Monkberry(name, text, options, callback) {
  if (options.normalizeWhitespace) {
    text = text.replace(/>\s+</g, '><');
  }

  var handler = new htmlparser.DomHandler(function (error, dom) {
    if (error) {
      console.error(error);
    } else {
      var compiler = new Compiler(name, dom);
      callback(compiler);
    }
  }, options);
  var parser = new htmlparser.Parser(handler, {
    recognizeSelfClosing: true
  });
  parser.write(text);
  parser.done();
}

module.exports = Monkberry;
