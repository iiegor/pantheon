import React from 'react'
import Style from '../resources/css/home.css'

@provide(['css/home.css', 'js/home.js'])
class HomeComponent extends React.Component {

  render() {
    return (
      <p>Hello from <span className={Style.highlight}>{this.constructor.name}!</span></p>
    );
  }

}

export default HomeComponent