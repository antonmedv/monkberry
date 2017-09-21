const sourceNode = require('./sourceNode')

function join(nodes, s) {
  return sourceNode(nodes).join(s)
}

module.exports = {join}
