var d = require('dejavu'),
	Controller = require('../Controller');

var HomeController = d.Class.declare({
	$name: 'HomeController',
	$extends: Controller,

	index: function(req, res) {
		res.render('home.html');
	},

	about: function(req, res) {
		res.render('about.html');
	}
});

module.exports = HomeController
