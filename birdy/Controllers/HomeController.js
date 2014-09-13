var Controller = Controller || {};

Controller.index = function(req, res)
{
	res.render('home.html');
}

module.exports = Controller
