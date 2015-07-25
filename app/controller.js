var services = null;

class Controller {
	constructor(birdy) {
		services = birdy.services;
	}

	static get services() {
		return services;
	}
};

export default Controller;
