var colors = require('colors')
console.log('Please wait while packages are loaded...'.gray)

// Packages
var dotenv    = require('dotenv'),
    express    = require('express'),
    nunjucks   = require('nunjucks'),
    path       = require('path'),
    fs         = require('fs'),
    i18n       = require('webmaker-i18n'),
    bodyParser = require('body-parser'),
    compression   = require('compression')

// Prepare
dotenv.load()

// Instantiate
var app         = express(),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, '/app/views'), process.env.TEMPLATES_CACHE))

// Setup the application
app.use(bodyParser.urlencoded({	extended: true	}))
app.use(bodyParser.json())
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(i18n.middleware({
  supported_languages: process.env.SUPPORTED_LANGS,
  default_lang: 'en-US',
  mappings: require('webmaker-locale-mapping'),
  translation_directory: path.resolve(__dirname, 'locales')
}))

if ('prod' == process.env.BIRDY_ENV) {
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

require('http').createServer(app).listen(process.env.BIRDY_PORT, function() {
	console.log('Birdy HTTP server is listening to %d (port) in %s (mode)!'.green, this.address().port, process.env.BIRDY_ENV);
})

if (process.env.HTTPS_ENABLED) require('https').createServer({
	key: process.env.HTTPS_KEY,
	cert: process.env.HTTPS_CERT
}, app).listen(process.env.HTTPS_PORT, function() {
	console.log('Birdy HTTPS server is listening to %d (port) in %s (mode) with https enabled!'.green, this.address().port, process.env.BIRDY_ENV)
})
