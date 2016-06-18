const DEBUG = !(process.argv.indexOf('--prod') > -1);

const express = require('express')
  , bodyParser = require('body-parser')
  , webpack = require('webpack')
  , crypto = require('crypto')
  , path = require('path')
  , fs = require('fs')
  , ect = require('ect')({ watch: DEBUG ? true : false, root : __dirname + '/views', ext : '.html' })
  , polyfill = require('./polyfill')
  , routes = require('./routes')
  , config = require('./config');

const app = express();
app.set('env', DEBUG ? 'development' : 'production');
app.set('x-powered-by', false);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

/**
 * Map features
 */
const features = {};
config.features.forEach((key, index) => {
  const name = key[0]
    , opts = key.slice(1);

  features[name] = opts;
});

/**
 * Helpers
 */
function createId(index) {
  const routesLen = routes.length
    , str = index.toString()
    , length = str.length;

  var id = '';
  if (routesLen >= 10) {
    for (var i = 0; i < length; i++) {
      id += length >= 2 ? str.charAt(i) : str;
      id += i == length - 1 ? '' : '_';
    }
  } else {
    id = str;
  }
  
  return id;
}

function provideAsset(fileName, filePath, fileType) {
  const fileHash = 
    new Buffer(crypto.createHash('md5').update(fileName).digest('hex'))
    .toString('base64').substr(0, fileName.length * 1.5);

  const fileVersion = +fs.statSync(filePath).mtime;
  const fileHeaders = {
    'content-type': `${fileType === 'css' ? 'text/css' : 'text/javascript'}; charset=utf-8`,
    'cache-control': 'public, max-age=31536000'
  };

  const urlPrefix = '/' + features.prefixAssets[0]
    , url = `${urlPrefix}/${fileType}/rs=${DEBUG ? fileName : fileHash}`;

  if (DEBUG) {
    app.get(url, function (req, res) {
      res.set(fileHeaders);
      res.end(fs.readFileSync(filePath, 'utf8'));
    });
  } else {
    const file = fs.readFileSync(filePath, 'utf8');

    app.get(url, function(req, res) {
      res.set(fileHeaders);
      res.end(file);
    });
  }

  return url;
}

/**
 * Map routes and their assets
 */
const routeMap = [];
routes.forEach((key, index) => {
  /**
   * Assign id and data object
   */
  key._id = 'u_' + createId(index);
  key._data = {};

  /**
   * Route context
   */
  key.context = {};
  key.context.set = (_key, value) => {
    key._data[_key] = value;
  };
  key.context.clean = () => {
    key._data = {};
  };

  routeMap.push(key.path);
});

/**
 * Compile, manage and serve assets
 */
// TODO: Combine assets if the feature is enabled
const assetMap = {};
Object.keys(polyfill.bundles).forEach((bundle) => {
  polyfill.bundles[bundle].forEach((key) => {
    const fileType = key[0]
      , fileName = path.basename(key[1])
      , filePath = path.join(__dirname, 'routes', key[1]);

    // `key[key.length - 1]` to obtain the resource.
    if (!assetMap[bundle]) {
      assetMap[bundle] = {};
    }

    if (!assetMap[bundle][fileType]) {
      assetMap[bundle][fileType] = [];
    }

    assetMap[bundle][fileType].push(provideAsset(fileName, filePath, fileType));
  });
});

/**
 * Server internal routes
 */
app.get('/_monitor/stats', (req, res) => {
  res.json({
    uptime: process.uptime(),
  });
});

/**
 * Renderer middleware
 */
/*app.all('*', function (req, res, next) {
  req.data = {};

  const method = req.method.toLowerCase();
  const index = routeMap.indexOf(req.path);
  const route = routes[index];

  if (index > -1 && route[method]) {
    route[method](req, res);

    route._data.styles = assetMap['app'].css;
    route._data.scripts = assetMap['app'].js;

    res.end(ect.render(route.view, route._data));
  } else {
    res.status(404);
    res.end('Not found');
  }
});*/
routes.forEach((route) => {
  app.all(route.path, (req, res, next) => {
    const method = req.method.toLowerCase();

    if (route[method]) {
      route[method](req, res);

      route._data.styles = assetMap['app'].css;
      route._data.scripts = assetMap['app'].js;

      res.end(ect.render(route.view, route._data));
    } else {
      next();
    }
  });
});

/**
 * Listen
 */
app.listen(process.env.PORT || config.port, function () {
  console.log('Listening at', config.port);
});