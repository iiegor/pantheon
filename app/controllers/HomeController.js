import Controller from '../controller'

let HomeComponent = require('../components/HomeComponent')
let AboutComponent = require('../components/AboutComponent')

class HomeController extends Controller {

	index(req, res) {
		/**
		 * Calling a service inside a controller:
		 * this.services['logger'].log('Hello!');
		 */
    
    res.render('home.html', HomeComponent)
  }

  about(req, res) {
    res.render('about.html', AboutComponent)
  }

}

export default HomeController
