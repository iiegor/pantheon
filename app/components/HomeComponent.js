import React from 'react'
import WindowElement from '../elements/WindowElement'

import '../resources/css/common.css'
import Style from '../resources/css/home.css'

@provide(['css/common.css', 'css/home.css', 'js/home.js'])
class HomeComponent extends React.Component {

  static renderMethod = 'renderToStaticMarkup';

  render() {
    return (
      <WindowElement title="A title" footer="Footer content">Hello from <span className={Style.highlight}>{this.constructor.name}!</span></WindowElement>
    );
  }
}

export default HomeComponent