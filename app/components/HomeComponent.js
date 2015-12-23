import React from 'react'
import ReactDOM from 'react-dom/server'
import Style from '../resources/css/home.css'

class HomeComponent extends React.Component {

  render() {
    return (
      <p>Hello from <span className={Style.highlight}>{this.constructor.name}!</span></p>
    );
  }

}

export default {
  js: {
    head: [global.services['provider'].provideSource('js/home.js')]
  },
  css: [global.services['provider'].provideSource('css/home.css')],
  output: ReactDOM.renderToStaticMarkup(<HomeComponent />)
}
