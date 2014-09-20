'use strict';

var d = require('dejavu'),
	fs = require('fs');

var Router = d.Class.declare({
	$name: 'Router',

	_app: null,
	_controllersDir: __dirname + '/Controllers/',
	_controllers: [],

	initialize: function(app) {
		this._app = app;

		this._loadControllers();

		this._init();
		this._statics(); // Others...
	},

	_init: function() {
		this._app.get('/', this._controllers['HomeController'].index);
		this._app.get('/about', this._controllers['HomeController'].about);
	},

	_statics: function() {
		// Error manifest
		this._app.use(function (req, res, next) {
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

		this._controllers[name] = new Controller(this);
	}
});

module.exports = Router;

/*
module.exports = function(app) {
	homeController = require('./Controllers/HomeController');
	aboutController = require('./Controllers/AboutController');

	// Get
	app.get('/', homeController.index);
	app.get('/about', aboutController.index);
	app.get('/about/birdy', aboutController.birdy);

	// Error manifest
	app.use(function (req, res, next) {
		res.status(404);

		res.render('error.html', {
			code: 404
		});
	});
}*/