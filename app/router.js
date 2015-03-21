import fs from 'fs';

export default class Router {
	constructor(app, controllers) {
		this.app = app;

		this.controllers = controllers;
	}

	bind() {
		/*
		 * TODO: Better definition for app routes.
		 */
		this.app.get('/', (req, res) => this.controllers['home'].index(req, res));
		this.app.get('/about', (req, res) => this.controllers['home'].about(req, res));
		this.app.get('/isomorphic', (req, res) => this.controllers['home'].isomorphic(req, res));
		this.app.get('/transition', (req, res) => this.transitionTo('/', res));
	}

	transitionTo(path, res) {
		return res.redirect(path);
	}
};
