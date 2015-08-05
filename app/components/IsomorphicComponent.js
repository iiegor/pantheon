import Component from '../component'
import React from 'react/addons'

export default React.createClass({

  displayName: 'IsomorphicComponent',
  mixins: [Component],

  render: function() {
    return (
      <p>Hello from {this.constructor.displayName}!</p>
    )
  }

})
