var Controller = Controller || {};

Controller.index = function(req, res)
{
	res.render('about.html');
}

Controller.birdy = function(req, res)
{
	res.render('about_birdy.html');
}

module.exports = Controller
