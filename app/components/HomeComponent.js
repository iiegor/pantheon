import React from 'react'
import Style from '../resources/css/home.css'

import Window from '../elements/WindowElement'

@provide(['css/home.css', 'js/home.js'])
class HomeComponent extends React.Component {

  static renderMethod = 'renderToStaticMarkup';

  render() {
    return (
      <Window title="A title">Hello from <span className={Style.highlight}>{this.constructor.name}!</span></Window>
    );
  }
}

export default HomeComponent