var d = require('dejavu'),
	Controller = require('../Controller');

var HomeController = d.Class.declare({
	$name: 'HomeController',
	$extends: Controller,

	index: function(req, res) {
		// Service call examples
		//this._services['logger'].log(
		//	'Example using logger service',
		//	'Second log'
		//);
		//this._services['emitter'].emit('hungry');

		res.render('home.html');
	},

	about: function(req, res) {
		res.render('about.html');
	}
});

module.exports = HomeController
