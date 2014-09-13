var Controller = Controller || {};

Controller.index = function(req, res)
{
	res.render('about.html');
}

module.exports = Controller
