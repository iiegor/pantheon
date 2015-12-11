import Controller from '../controller'
import React from 'react'
import ReactDOM from 'react-dom/server'

import IsomorphicComponent from '../components/IsomorphicComponent'

class HomeController extends Controller {

	index(req, res) {
		/**
		 * Calling a service inside a controller:
		 * this.services['logger'].log('Hello!');
		 */
     
     res.render('home.html')
   }

   isomorphic(req, res) {
    let component = React.createFactory(IsomorphicComponent)

    res.render('isomorphic.html', {
      styles: IsomorphicComponent.styles,
      output: ReactDOM.renderToString(component({}))
    })
  }

  about(req, res) {
    res.render('about.html')
  }

}

export default HomeController
