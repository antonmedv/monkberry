module.exports = {
  Text: ({node, source, compile}) => {
    // Trim new lines and white spaces to a single whitespace.
    const text = JSON.stringify(node.text.replace(/^\s+|\s+$/g, ' '))
    return source`document.createTextNode(${text})`
  }
}
