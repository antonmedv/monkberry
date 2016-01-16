export default function (ast) {
  ast.CommentNode.prototype.compile = function (figure) {
    return null;
  };
}
