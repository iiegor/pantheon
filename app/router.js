class Router {

	constructor(app, birdy) {
		this.app = app

		this.birdy = birdy
	}
	
  link(path, controller) {
    if (!controller) return

    let method = 'get'

    if (path.constructor === Array) {
      method = path
      path = controller
      controller = arguments[2]
    }

		// Route and bind the controller
    this.app[method](path, controller.bind(this.birdy))
  }

  handlePagelet(pagelet) {
    this.app.get(pagelet.path, (req, res) => res.render(pagelet.view, pagelet._res))
  }

  linkDefaults() {
    /* Error page */
    this.app.use((req, res, next) => {
      res.status(404)

      res.render('error.html', {code: 404})
    })
  }

  transitionTo(path, res) {
    return res.redirect(path)
  }
}

export default Router