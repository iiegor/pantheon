module.exports = {
  path: '/',
  view: 'index',

  /**
   * NOTE: The following methods are executed on every request so
   *  large tasks will increase the page load time.
   */
  get(req, res) {
    this.context.set('title', 'Home');
  }
};
