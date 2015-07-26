import fs from 'fs';

class Router {
	constructor(app) {
		this.app = app;

		this.services = {};
	}

	/*
	 * Link the path with the controller
	 */
	link(path, controller) {
		if (!controller) return;

		this.app.get(path, controller);
	}

	linkDefaults() {
		/* Error page */
		this.app.use((req, res, next) => {
			res.status(404);

			res.render('error.html', {code: 404});
		});
	}

	transitionTo(path, res) {
		return res.redirect(path);
	}
};

export default Router;