import React from 'react'
import StyleSheet from 'stilr'

var CSS = StyleSheet.create({
  p: {
    backgroundColor: 'red'
  },

  h2: {
    color: 'blue'
  }
})

/**
 * TODO:
 *  Cache StyleSheet.render() instead of running it every request
 *  Add a route to request the cached css (ex. /assets/style-hash.css or similar)
 */
export default class IsomorphicComponent extends React.Component {

  render() {
    return (
      <p className={CSS.p}>Hello from {this.constructor.name}!</p>
    );
  }

  static get styles() {
    console.log('called!')

    return StyleSheet.render()
  }

  static get classes() {
    return CSS
  }

}