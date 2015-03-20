import Controller from '../controller';

export default class HomeController extends Controller {
	name: 'HomeController'

	index(req, res) {
		// Service call examples
		//this._services['logger'].log(
		//	'Example using logger service',
		//	'Second log'
		//);
		//this._services['emitter'].emit('hungry');

		res.render('home.html');
	}

	about(req, res) {
		res.render('about.html');
	}
};
