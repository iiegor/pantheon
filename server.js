var chalk = require('chalk')
console.log(chalk.gray('Please wait while packages are loaded...'))

// Packages
var express = require('express'),
  nunjucks = require('nunjucks'),
  path = require('path'),
  fs = require('fs'),
  i18n = require('webmaker-i18n'),
  bodyParser = require('body-parser'),
  compression = require('compression')

// Instantiate
var app = express(),
  config = require('./config'),
  nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, '/app/views'), config.FEATURES['with-view-cache']))

// Setup the application
app.use(bodyParser.urlencoded({	extended: true	}))
app.use(bodyParser.json())
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(i18n.middleware({
  supported_languages: '*',
  default_lang: 'en-US',
  mappings: require('webmaker-locale-mapping'),
  translation_directory: path.resolve(__dirname, 'locales')
}))

if ('production' == config.environment) {
  app.disable('verbose errors')
  app.use(compression())
}

app.disable('x-powered-by')

nunjucksEnv.express(app)
nunjucksEnv.addFilter('instantiate', function(input) {
  var tmpl = new nunjucks.Template(input)

  return tmpl.render(this.getVariables())
})

// Localized strings
app.locals.languages = i18n.getSupportLanguages()
app.get('/strings/:lang?', i18n.stringsRoute('en_US'))

// Boot the application
require('babel/register'), new (require('./app/birdy'))(app)

require('http').createServer(app).listen(config.port, function() {
	console.log(chalk.green('Birdy HTTP server is listening to %d (port) in %s (mode)!'), this.address().port, config.environment);
})

if (config.FEATURES['with-https']) require('https').createServer({
	key: config.APP.HTTPS.key,
	cert: config.APP.HTTPS.cert
}, app).listen(config.APP.HTTPS.port, function() {
	console.log(chalk.green('Birdy HTTPS server is listening to %d (port) in %s (mode) with https enabled!'), this.address().port, config.environment)
})
