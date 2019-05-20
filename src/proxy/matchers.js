function includes (src, dest) {
  return src.includes(dest)
}

function equals (src, dest) {
  return src === dest
}

function endsWidth (src, dest) {
  return src.endsWidth(dest)
}

function startsWidth (src, dest) {
  return src.startsWidth(dest)
}

module.exports = {
  includes,
  equals,
  endsWidth,
  startsWidth
}
