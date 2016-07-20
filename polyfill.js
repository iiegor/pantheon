var bundles = exports.bundles = {};

Array.prototype.bundle = function (name) {
  if (!bundles[name]) {
    bundles[name] = this;
  } else {
    // Merge arrays with a looped insertion
    for (var i = 0; i < this.length; i++) {
      bundles[name].push(this[i]);
    }
  }

  return this;
};