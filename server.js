const DEBUG = process.argv.indexOf('--prod') === -1;

const express = require('express')
  , bodyParser = require('body-parser')
  , utils = require('loader-utils')
  , crypto = require('crypto')
  , path = require('path')
  , fs = require('fs')
  , ect = require('ect')({ watch: DEBUG, root : __dirname + (DEBUG ? '/views' : '/.build/views'), ext : '.html' })
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
config.features.forEach(key => {
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
      id += i === length - 1 ? '' : '_';
    }
  } else {
    id = str;
  }
  
  return id;
}

function generateNonce() {
  var str = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-+/';

  for (var i = 0; i < 27; i++) {
    str += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return str;
}

function provideAsset(fileName, filePath, fileType, bundleName) {
  const fileVersion = +fs.statSync(filePath).mtime;
  const fileHash =
    utils.getHashDigest(String(fileVersion), 'sha1', 'base64', 10) + '_' +
    utils.getHashDigest(fileName, 'sha1', 'base64', 15);
  const fileHeaders = {
    'content-type': `${fileType === 'css' ? 'text/css' : 'text/javascript'}; charset=utf-8`,
    'cache-control': 'public, max-age=31536000'
  };

  const urlPrefix = '/' + features.prefixAssets[0]
    , url = `${urlPrefix}/b=${bundleName}/${fileType === 'css' ? 'ss' : fileType}/rs=${DEBUG ? fileName : fileHash}`;

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
const bundleMap = new Map();

Object.keys(polyfill.bundles).forEach((bundle) => {
  polyfill.bundles[bundle].forEach((key) => {
    const fileType = key[0]
      , fileName = path.basename(key[1]);
    
    const filePath = DEBUG
      ? path.join(__dirname, 'statics', key[1])
      : path.join(__dirname, '.build', 'statics', key[1]);

    if (!bundleMap.has(bundle)) {
      bundleMap.set(bundle, {});
    }

    if (!bundleMap.get(bundle)[fileType]) {
      bundleMap.get(bundle)[fileType] = [];
    }

    bundleMap.get(bundle)[fileType].push(provideAsset(fileName, filePath, fileType, bundle));
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
routes.forEach((route) => {
  app.all(route.path, (req, res, next) => {
    const method = req.method.toLowerCase();

    if (route[method]) {
      route[method](req, res);

      route._data.bundles = bundleMap;
      route._data.nonce = generateNonce();

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