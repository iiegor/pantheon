import Router from './router'

export default class Controller {
	constructor(router) {
		if (!router instanceof Router) {
			console.log(`Controller ${this.name} was not initialized correctly`);
		}

		this._router = router;
		this._services = router.services;
	}
};
