import fs from 'fs';

export default class Router {
	constructor(app) {
		this.app = app;

		this.services = {};
	}

	/*
	 * Link the path with the controller
	 */
	link(path, extend, controller) {
		if (!controller) return;

		if (extend) {
			this.app.get(path, controller);
			return;
		}

		this.app.get(path, (req, res) => controller(req, res));
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
