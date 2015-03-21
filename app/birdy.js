import fs from 'fs';
import path from 'path';
import Router from './router';

class Birdy {
	constructor(app) {
		this.routes = [];
		this.controllers = [];
		this.services = [];

		// Set components dir
		this._controllersDir = path.join(__dirname, 'controllers');
		this._servicesDir = path.join(__dirname, 'services');

		// Register components
		this._registerRoutes();
		this._registerControllers();
		this._registerServices();

		let router = new Router(app, this.controllers);
		router.bind();
	}

	_registerRoutes() {
		/*
		 * TODO: Register application routes.
		 */
	}

	_registerControllers() {
		var controllers = fs.readdirSync(this._controllersDir);

		controllers.forEach(controller => {
			var controllerName = controller.split('.', 1)[0];
			var controller = require(path.resolve(this._controllersDir, controllerName));

			this.controllers[controllerName.toLowerCase().replace('controller', '')] = new controller(this);
		});
	}

	_registerServices() {
		var services = fs.readdirSync(this._servicesDir);

		services.forEach(service => {
			var serviceName = service.split('.', 1)[0];
		 	var service = require(path.resolve(this._servicesDir, serviceName));

			this.services[serviceName.toLowerCase().replace('service', '')] = service;
		});
	}
};

export default Birdy;
