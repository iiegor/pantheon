import fs from 'fs'

class Router {

	constructor(app, birdy) {
		this.app = app

		this.birdy = birdy
	}

	/*
	 * Link the path with the controller
	 */
  link(path, controller) {
    if (!controller) return

    let method = ['get']

    if (path.constructor === Array) {
      method = path
      path = controller
      controller = arguments[2]
    }

		// Route and bind the controller
    this.app[method](path, controller.bind(this.birdy))
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