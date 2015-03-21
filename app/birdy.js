import fs from 'fs';
import path from 'path';
import router from './router';

class Birdy {
	constructor(app) {
		this.router = new router(app);
		this.controllers = [];
		this.services = [];

		// Set components dir
		this._controllersDir = path.join(__dirname, 'controllers');
		this._servicesDir = path.join(__dirname, 'services');

		// Register components
		this._registerServices();
		this._registerControllers();
		this._registerRoutes();
	}

	_registerRoutes() {
		/*
		 * TODO: Better definition for app routes.
		 */
		this.router.link('/', false, this.controllers['home'].index);
		this.router.link('/about', false, this.controllers['home'].about);
		this.router.link('/isomorphic', false, this.controllers['home'].isomorphic);
		this.router.link('/transition', true, (req, res) => this.router.transitionTo('/', res));

		this.router.linkDefaults();
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

			this.services[serviceName.toLowerCase().replace('service', '')] = new service();
		});
	}
};

export default Birdy;
