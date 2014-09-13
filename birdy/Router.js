module.exports = function(app) {
	homeController = require('./Controllers/HomeController');
	aboutController = require('./Controllers/AboutController');

	// Get
	app.get('/', homeController.index);
	app.get('/about', aboutController.index);

	// Error manifest
	app.use(function (req, res, next) {
		res.status(404);

		res.render('error.html', {
			code: 404
		});
	});
}