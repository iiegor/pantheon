import fs from 'fs'
import path from 'path'
import router from './router'

class Birdy {

	constructor(app) {
		this.router = global.router = new router(app, this)
		this.controllers = []
		this.services = global.services = []

		// Set components dir
		this._controllersDir = path.join(__dirname, 'controllers')
		this._servicesDir = path.join(__dirname, 'services')

		// Register components
		this._registerServices()
		this._registerRoutes()
	}

	import(name) {
		if (!this.controllers[name]) {
			var controllerName = name.charAt(0).toUpperCase() + name.slice(1)
			var controller = require(path.resolve(this._controllersDir, controllerName.concat('Controller.js')))

			this.controllers[name] = new controller(this)
		}

		return this.controllers[name]
	}

	_registerRoutes() {
		this.router.link('/', this.import('home').index)
		this.router.link('/transition', (req, res) => this.router.transitionTo('/', res))

		this.router.linkDefaults()
	}

	_registerServices() {
		var services = fs.readdirSync(this._servicesDir)

		services.forEach(service => {
			var serviceName = service.split('.', 1)[0]
      var service = require(path.resolve(this._servicesDir, serviceName))

      this.services[serviceName.toLowerCase().replace('service', '')] = new service()
    })
	}
	
}

export default Birdy