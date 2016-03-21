import fs from 'fs'
import path from 'path'
import loaderUtils from 'loader-utils'

import router from './router'

class Birdy {

	constructor(app) {
		this.router = global.router = new router(app, this)
		this.controllers = []
		this.services = []

		// Set components dir
		this._controllersDir = path.join(__dirname, 'controllers')
		this._pageletsDir = path.join(__dirname, 'pagelets')
		this._servicesDir = path.join(__dirname, 'services')

		// Register components
		this._registerServices()
		this._registerPagelets()
	}

	import(name) {
		if (!this.controllers[name]) {
			var controllerName = name.charAt(0).toUpperCase() + name.slice(1)
			var controller = require(path.resolve(this._controllersDir, controllerName.concat('Controller.js')))

			this.controllers[name] = new controller(this)
		}

		return this.controllers[name]
	}

	_registerPagelets() {
		var pagelets = fs.readdirSync(this._pageletsDir)

		// TODO: Render child pagelets
		pagelets.forEach(pagelet => {
			var pageletName = pagelet.slice(0, -3)
			var pagelet = require(path.resolve(this._pageletsDir, pageletName))

			if (!pagelet.name)
				pagelet.name = pageletName

			pagelet._id = loaderUtils.getHashDigest(pagelet.name, '', 'base64', 15)
			pagelet._res = this.services['provider'].provide(pagelet.css, pagelet.js)

			pagelet._res.pagelet = pagelet._id

			this.services['logger'].log(`Pagelet ${pagelet.name} (${pagelet._id}) served.`)

			this.router.handlePagelet(pagelet)
		})
		
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