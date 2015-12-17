import React from 'react'
import ReactDOM from 'react-dom/server'
import StyleSheet from 'stilr'

let style = StyleSheet.create({
  highlight: {
    color: 'red'
  }
})

class HomeComponent extends React.Component {

  render() {
    return (
      <p>Hello from <span className={style.highlight}>{this.constructor.name}!</span></p>
    );
  }

}

export default {
  js: {
    head: [global.services['provider'].provide('console.log("Head javascript");', 'js')],
    body: [global.services['provider'].provide('console.log("Body javascript");', 'js')]
  },
  css: [global.services['provider'].provide(StyleSheet.render(), 'css')],
  output: ReactDOM.renderToStaticMarkup(<HomeComponent />)
}
