import React from 'react'
import StyleSheet from 'stilr'

var CSS = StyleSheet.create({
  p: {
    backgroundColor: 'red'
  }
})

export default class IsomorphicComponent extends React.Component {

  render() {
    return (
      <p className={CSS.p}>Hello from {this.constructor.displayName}!</p>
    );
  }

  static get styles() {
    return StyleSheet.render()
  }

}

export var a = {

}
