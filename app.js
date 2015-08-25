var colors = require('colors')
console.log('Please wait while packages are loaded...'.gray)

// Packages
var habitat    = require('habitat'),
    express    = require('express'),
    nunjucks   = require('nunjucks'),
    path       = require('path'),
    fs         = require('fs'),
    i18n       = require('webmaker-i18n'),
    bodyParser = require('body-parser')

// Prepare
habitat.load()

// Instantiate
var app         = express(),
    env         = new habitat('birdy'),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, '/app/views'), env.get('TEMPLATES_CACHE')))

// Setup the application
if ('prod' == env.get('ENV')) app.disable('verbose errors')

app.use(bodyParser.urlencoded({	extended: true	}))
app.use(bodyParser.json())
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(i18n.middleware({
  supported_languages: env.get('SUPPORTED_LANGS'),
  default_lang: 'en-US',
  mappings: require('webmaker-locale-mapping'),
  translation_directory: path.resolve(__dirname, 'locales')
}))

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

require('http').createServer(app).listen(env.get('SERVICE_PORT'), function() {
	console.log('Birdy HTTP server is listening to %d (port) in %s (mode)!'.green, env.get('SERVICE_PORT'), env.get('ENV'));
})

if (env.get('HTTPS_ENABLED')) require('https').createServer({
	key: fs.readFileSync(env.get('HTTPS_KEY')),
	cert: fs.readFileSync(env.get('HTTPS_CERT'))
}, app).listen(env.get('HTTPS_PORT'), function() {
	console.log('Birdy HTTPS server is listening to %d (port) in %s (mode) with https enabled!'.green, env.get('HTTPS_PORT'), env.get('ENV'))
})
