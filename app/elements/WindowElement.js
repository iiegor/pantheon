import React from 'react'

class WindowElement extends React.Component {

  render() {
    return (
      <div>
        <div className="window-title">{ this.props.title }</div>
        <div className="window-content">{ this.props.children }</div>
      </div>
    );
  }
}

export default WindowElement