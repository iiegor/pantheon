# Pantheon ![npm-deps](https://david-dm.org/iiegor/pantheon.svg)

> Node.js web server focused on performance and simplicity using the latest technologies

## Features

### CSS class renaming

![compress-diff](http://image.prntscr.com/image/8a848a93db4942239c45e5c435ab1d49.png)

##### **Difference between development and production code*

###### Exporting class names
```css
.login-tab .exportTitle { /* .NjA-NTk .exportTitle */
  font-size: 20px;
  color: #000;
}
```

### Resource bundles

You can create bundles that contains multiple static resources and require them when needed.

```javascript
module.exports = {
  path: '/route',
  
  assets: [
    ['css', 'styles/route-style.js', 'sync'], // Source code will be writen into the DOM
    ['js', 'scripts/route-script.js'],
  ].bundle('ApplicationUi'),
  
  // ..
};
```

```html
{% for script in bundles.get('ApplicationUi').js %}
  <script src="{{ script.url }}"></script>
{% endfor %}
```

### Effective asset distribution

![asset-dist-diff](http://image.prntscr.com/image/127e679f1b964b79a823864073c9e743.png)

While on development all assets will be called following this syntax:

``/_/pantheon/_/b={resourceBundle}/{resourceType}/rs={resourceName}``

On production, the resource name will be replaced by a string concatenation of the ``last modification time`` of the file with the resource name (string is hashed).

## Installation

You can get the latest stable release from the [releases](https://github.com/iiegor/pantheon/releases) page.

Once you've downloaded it, you are ready to run ``$ npm install`` to install all the needed dependencies by the server.

## Lincese
MIT © [Iegor Azuaga](https://github.com/iiegor)
