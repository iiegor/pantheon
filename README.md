# Pantheon

> Node.js web server focused on performance and simplicity using the latest technologies

## Features

### CSS class renaming

![compress-diff](http://image.prntscr.com/image/8a848a93db4942239c45e5c435ab1d49.png)

##### **Difference between development and production code*

### Resource bundles

You can create bundles that contains multiple static resources and require them when needed.

```javascript
module.exports = {
  path: '/route',
  
  assets: [
    ['js', 'scripts/route-script.js'],
  ].bundle('RouteBundle'),
  
  // ..
};
```

```html
<% for script in @bundles.get('RouteBundle').js : %>
  <script src="<%- script %>" nonce="<%- @nonce %>"></script>
<% end %>
```
