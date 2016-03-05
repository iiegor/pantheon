import React from 'react'

import Style from '../resources/css/common.css'

class WindowElement extends React.Component {

  render() {
    return (
      <div className={ Style.window }>
        <div className={ Style.windowContent }>{ this.props.children }</div>
        <div className={ Style.windowFooter }>{ this.props.footer }</div>
      </div>
    );
  }
}

export default WindowElement