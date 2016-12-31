const DEBUG = process.argv.indexOf('--prod') === -1;

const express = require('express')
  , bodyParser = require('body-parser')
  , utils = require('loader-utils')
  , path = require('path')
  , fs = require('fs')
  , nunjucks = require('nunjucks')
  , compression = require('compression')
  , routes = require('./routes')
  , config = require('./config');

const app = express();
app.set('env', DEBUG ? 'development' : 'production');
app.set('x-powered-by', false);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(express.static('public'));

/**
 * Setup nunjucks environment
 */
const nunjucksEnv = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(__dirname, (DEBUG ? '/views' : '/.build/views')), {
    watch: true,
  })
);

nunjucksEnv.express(app);

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

  const url = `/_/pantheon/_/b=${bundleName}/${fileType === 'css' ? 'ss' : fileType}/rs=${DEBUG ? fileName : fileHash}`;

  if (DEBUG) {
    app.get(url, function (req, res) {
      res.set(fileHeaders);
      res.end(fs.readFileSync(filePath, 'utf8'));
    });
  } else {
    const file = fs.readFileSync(filePath, 'utf8').concat(fileType === 'css' ? 'pantheon{}' : '');

    app.get(url, function(req, res) {
      res.set(fileHeaders);
      res.end(file);
    });
  }

  return url;
}

/**
 * Map routes
 */
const assetMap = new Map();

routes.forEach((route, index) => {
  route._id = 'r_' + createId(index);
  route._data = {};
  route.assets = route.assets || [];

  // Route context
  route.context = {};

  route.context.set = (key, value) => {
    route._data[key] = value;
  };

  route.context.clean = () => {
    route._data = {};
  };

  // Provide route assets
  route.assets.forEach(asset => {
    const basePath = DEBUG ? path.join(__dirname, 'statics')
      : path.join(__dirname, '.build', 'statics');

    let filePath = '';
    if (asset.includes('style!')) {
      filePath = path.join(basePath, 'styles', `${asset.replace('style!', '')}.css`);
    } else if (asset.includes('script!')) {
      filePath = path.join(basePath, 'scripts', `${asset.replace('script!', '')}.js`);
    }

    assetMap.set(asset, provideAsset(
      /*fileName*/path.basename(filePath),
      filePath,
      /*fileType*/path.extname(filePath).substr(1),
      /*bundleName*/route._id));
  });
});

/**
 * Serve bundles
 */
const bundleMap = new Map();

Object.keys(config.bundles).forEach((bundle) => {
  config.bundles[bundle].forEach((key) => {
    const fileType = key[0]
      , fileName = path.basename(key[1])
      , fileMode = key[2] || 'async';
    
    const filePath = DEBUG ? path.join(__dirname, 'statics', key[1])
      : path.join(__dirname, '.build', 'statics', key[1]);

    if (!bundleMap.has(bundle)) {
      bundleMap.set(bundle, {});
    }

    if (!bundleMap.get(bundle)[fileType]) {
      bundleMap.get(bundle)[fileType] = [];
    }

    const resource = fileMode === 'async' ? { url: provideAsset(fileName, filePath, fileType, bundle) }
      : { source: fs.readFileSync(filePath, 'utf8') };

    resource.mode = fileMode;

    // Watch for changes on sync mode
    if (DEBUG && resource.mode === 'sync') {
      fs.watch(filePath, {encoding: 'buffer'}, () => resource.source = fs.readFileSync(filePath, 'utf8'));
    }

    bundleMap.get(bundle)[fileType].push(resource);
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

      route._data.view = route.view;
      route._data.bundles = bundleMap;
      route._data.assets = assetMap;
      route._data.nonce = generateNonce();

      res.render(route.view, route._data);
    } else {
      next();
    }
  });
});

/**
 * Error page
 */
app.use((req, res) => res.end('Not found'));

/**
 * Listen
 */
app.listen(process.env.PORT || config.port, function () {
  console.log('Listening at', config.port);
});