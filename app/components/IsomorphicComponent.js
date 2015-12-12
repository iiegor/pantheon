import React from 'react'
import ReactDOM from 'react-dom/server'
import StyleSheet from 'stilr'

var CSS = StyleSheet.create({
  p: {
    backgroundColor: 'red'
  },

  nav: {
    color: 'blue',
    padding: '12px',
    backgroundColor: 'black',
    margin: 0
  },

  navLink: {
    textDecoration: 'none',
    padding: '12px 5px',
    color: 'inherit'
  }
})

class IsomorphicComponent extends React.Component {

  render() {
    return (
      <p className={CSS.p}>Hello from {this.constructor.name}!</p>
    );
  }

}

export default {
  styles: StyleSheet.render(),
  classes: CSS,
  output: ReactDOM.renderToString(React.createFactory(IsomorphicComponent)({}))
}
