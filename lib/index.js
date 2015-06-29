var htmlparser = require('htmlparser2');
var drawTree = require('asciitree');
var through = require('through');
var path = require('path');
var fs = require('fs');
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

Monkberry.monkberrify = function (file) {
  if (/\.(monk|html)$/.test(file)) {
    var data = '', stream = through(write, end);
    return stream;
  } else {
    return through();
  }

  function write(buf, enc, next) {

    var name = path.parse(file).name;
    console.log(file);
    var text = fs.readFileSync(file, {encoding: 'utf8'});
    Monkberry(name, text, {
      normalizeWhitespace: true
    }, function (compiler) {
      data += compiler.compile(true);
    });
  }

  function end() {
    stream.queue(data);
    stream.queue(null);
  }
};

module.exports = Monkberry;
