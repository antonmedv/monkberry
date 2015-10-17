'use strict';

require('../parser');

var _sourceMap = require('source-map');

var n = new _sourceMap.SourceNode(1, 2, 3, null);
console.log(n);