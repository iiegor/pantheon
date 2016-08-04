## Components

*routes/home/index.js*
```javascript
module.exports = {
  path: '/',

  assets: ['script!sidebar.js', 'style!sidebar.css'],

  components: [
    sidebar: require('./components/sidebar.js').flags('async')
  ],
};
```

*views/home.html*
```html
<aside data-referrer="component_sidebar"><!-- .. --></aside>

<section id="content">
  Some content!
</section>
```