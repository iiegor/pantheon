import Controller from '../controller';
import React from 'react/addons';

import IsomorphicComponent from '../components/IsomorphicComponent'

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

	isomorphic(req, res) {
		var factory = React.createFactory(IsomorphicComponent);
		var reactHTML = React.renderToString(factory({}));

		res.render('isomorphic.html', {
			output: reactHTML
		});
	}

	about(req, res) {
		res.render('about.html');
	}
};
