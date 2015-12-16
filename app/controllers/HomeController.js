import Controller from '../controller'

let IsomorphicComponent = require('../components/IsomorphicComponent')

class HomeController extends Controller {

	index(req, res) {
		/**
		 * Calling a service inside a controller:
		 * this.services['logger'].log('Hello!');
		 */

    res.render('home.html')
  }

  isomorphic(req, res) {
    res.render('isomorphic.html', IsomorphicComponent)
  }

}

export default HomeController
