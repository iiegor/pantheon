exports.bundles = {};

Array.prototype.bundle = function (name) {
  if (!exports.bundles[name]) {
    exports.bundles[name] = this;
  } else {
    // Merge arrays with a looped insertion
    for (var i = 0; i < this.length; i++) {
      exports.bundles[name].push(this[i]);
    }
  }

  return this;
};