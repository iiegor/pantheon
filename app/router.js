import fs from 'fs';

export default class Router {
	constructor(app, services) {
		this.app = app;
		this.services = services;
		this.controllers = [];
		this._controllersDir = __dirname + '/controllers/';

		this._loadControllers();

		this._init();
		this._statics(); // Others...
	}

	_init() {
		var Router = this;

		this.app.get('/', (req, res) => {

			Router.controllers['HomeController'].index(req, res);

		}), this.app.get('/about', (req, res) => {

			Router.controllers['HomeController'].about(req, res);

		}), this.app.get('/isomorphic', (req, res) => {

			Router.controllers['HomeController'].isomorphic(req, res);

		}), this.app.get('/transition', (req, res) => {

			Router.transitionTo('/', res);

		});
	}

	_statics() {
		// Error manifest
		this.app.use(function (req, res, next) {
			res.status(404);

			res.render('error.html', {
				code: 404
			});
		});
	}

	_loadControllers() {
		var controllers = fs.readdirSync(this._controllersDir),
			controller,
			controllerName;

		for (controller in controllers) {
			controllerName = controllers[controller].split('.', 1)[0];

			if(!controllerName) continue;

			// Load the service
			this._loadController(controllerName, this._controllersDir + controllerName)
		}
	}

	_loadController(name, path) {
		var Controller = require(path);

		this.controllers[name] = new Controller(this);
	}

	transitionTo(path, res) {
		return res.redirect(path);
	}
};
