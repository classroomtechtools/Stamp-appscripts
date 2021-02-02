function assign () {
  const {assign} = Import;
  return assign;
}

function merge () {
  const {merge} = Import;
  return merge;
}

function it (...params) {
  const {stampit} = Import;
  return stampit(...params);
}

function init (...params) {
  const {stampit} = Import;
  return stampit.init(...params);
}

function compose (...params) {
  const {stampit} = Import;
  return stampit.compose(...params);
}

function methods (...param) {
  const {stampit} = Import;
  return stampit.methods(...params);
}

function conf (...param) {
  const {stampit} = Import;
  return stampit.conf(...params);
}

function statics (...param) {
  const {stampit} = Import;
  return stampit.statics(...params);
}
