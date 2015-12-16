import Controller from '../controller'

let HomeComponent = require('../components/HomeComponent')

class HomeController extends Controller {

	index(req, res) {
		/**
		 * Calling a service inside a controller:
		 * this.services['logger'].log('Hello!');
		 */
    
    res.render('home.html', HomeComponent)
  }

}

export default HomeController
