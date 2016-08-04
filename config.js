module.exports = {
  port: 8080,

  bundles: {
    'QuantumUi': [
      ['css', 'styles/fonts.css', 'sync'],
      ['css', 'styles/quantum.css', 'async'],
      ['css', 'styles/quantum.theme.css', 'sync'],
      ['js', 'scripts/quantum.js'],
    ],

    // ..
  },

  build: {
    // See html-minifier documentation.
    html: {
      removeComments: true,
      collapseWhitespace: true,
    },

    css: {
      scopeBehavior: 'local',
      selectorPattern: 'basic',
    }
  }
};
