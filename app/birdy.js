import fs from 'fs';
import Router from './router';

export default class Birdy {
	constructor(app) {
		this._services = [];
		this._servicesDir = __dirname + '/services/';

		this._bootServices();

		this._router = new Router(app, this._services);
	}

	_bootServices() {
		var services = fs.readdirSync(this._servicesDir),
			service,
			serviceName;

		for (service in services) {
			serviceName = services[service].split('.', 1)[0];

			if(!serviceName) continue;

			// Load the service
			this._loadService(serviceName.toLowerCase(), this._servicesDir + serviceName)
		}
	}

	_loadService(name, path) {
		var Service = require(path);

		this._services[name.replace('service', '')] = new Service();
	}
};
