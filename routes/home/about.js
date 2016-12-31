module.exports = {
  path: '/about',
  view: 'about',

  assets: [
    'style!routes/about',
  ],

  /**
   * NOTE: The following methods are executed on every request so
   *  large tasks will increase the page load time.
   */
  get() {
    this.context.set('title', 'About');
  }
};
