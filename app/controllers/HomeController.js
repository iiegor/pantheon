import Controller from '../controller'
import React from 'react/addons'

import IsomorphicComponent from '../components/IsomorphicComponent'

class HomeController extends Controller {

	index(req, res) {
		/**
		 * Calling a service inside a controller:
		 * HomeController.services['logger'].log('example');
		 */

		res.render('home.html')
	}

	isomorphic(req, res) {
		var factory = React.createFactory(IsomorphicComponent)
		var reactHTML = React.renderToString(factory({}))

		res.render('isomorphic.html', {
			output: reactHTML
		})
	}

	about(req, res) {
		res.render('about.html')
	}

}

export default HomeController
