module.exports = {
  path: '/promotion/:id',
  view: 'view',

  childrens: [],

  /**
   * NOTE: The following methods are executed on every request so
   *  large tasks will increase the page load time.
   */
  get(req, res) {
    this.context.set('title', 'Prueba de promoción!');
    this.context.set('id', req.params.id);
  },
};