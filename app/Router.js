'use strict';

var d = require('dejavu'),
	fs = require('fs');

var Router = d.Class.declare({
	$name: 'Router',

	app: null,
	services: [],
	controllers: [],
	_controllersDir: __dirname + '/controllers/',

	initialize: function(app, services) {
		this.app = app;
		this.services = services;

		this._loadControllers();

		this._init();
		this._statics(); // Others...
	},

	_init: function() {
		var Router = this;

		this.app.get('/', function(req, res) {

			Router.controllers['HomeController'].index(req, res);

		}), this.app.get('/about', function(req, res) {

			Router.controllers['HomeController'].about(req, res);

		}), this.app.get('/transition', function(req, res) {

			Router.transitionTo('/', res);

		});
	},

	_statics: function() {
		// Error manifest
		this.app.use(function (req, res, next) {
			res.status(404);

			res.render('error.html', {
				code: 404
			});
		});
	},

	_loadControllers: function() {
		var controllers = fs.readdirSync(this._controllersDir),
			controller,
			controllerName;

		for (controller in controllers) {
			controllerName = controllers[controller].split('.', 1)[0];

			if(!controllerName) continue;

			// Load the service
			this._loadController(controllerName, this._controllersDir + controllerName)
		}
	},

	_loadController: function(name, path) {
		var Controller = require(path);

		this.controllers[name] = new Controller(this);
	},

	transitionTo: function(path, res) {
		return res.redirect(path);
	}
});

module.exports = Router;
