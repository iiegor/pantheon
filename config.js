module.exports = {
  port: process.env.PORT || 8080,

  bundles: {
    'pantheon.ui': [
      /** @info Layout reset & polyfills */
      ['css', 'styles/pantheon.reset.css'],

      /** @info Pantheon UI */
      ['css', 'styles/pantheon.fonts.css', 'sync'],
      ['css', 'styles/pantheon.theme.css', 'sync'],
      ['js', 'scripts/pantheon.site.js', 'sync'],
    ],

    // ..
  },

  build: {
    /** @info See html-minifier documentation. */
    html: {
      removeComments: true,
      collapseWhitespace: true,
    },

    css: {
      scopeBehavior: 'local', //=> [local, global]
      selectorPattern: 'webpack', //=> [default, split, webpack]
    },

    js: {
      minifier: 'closure',  //=> [closure, uglify]
    }
  }
};
