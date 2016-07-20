module.exports = {
  path: '/([\+])/promotion',
  view: 'create',
  
  /**
   * NOTE: Order sensitive
   */
  assets: [
    ['js', 'scripts/home.js'],
    ['css', 'styles/home.css'],
  ].bundle('QuantumUi'),

  childrens: [],

  /**
   * NOTE: The following methods are executed on every request so
   *  large tasks will increase the page load time.
   */
  get(req, res) {
    this.context.set('title', 'Crear promoción');
    this.context.set('published', false);
  },

  post(req, res) {
    this.context.set('title', 'Promoción publicada!');
    this.context.set('published', true);
    this.context.set('link', 'http://' + req.hostname + '/promotion/' + this.generateUUID());
  },

  /**
   * Internal methods
   */
  generateUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + '-' + s4() + s4();
  },
};