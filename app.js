var habitat = require('habitat');
var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');
var fs = require('fs');
var i18n = require('webmaker-i18n');
var bodyParser = require('body-parser');
var nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'views')));

// Prepare
habitat.load();

// Instantiate
var app = express(),
	env = new habitat('birdy');

app.use(bodyParser.urlencoded({	extended: true	}));
app.use(bodyParser.json());

// Setup the application
if ('prod' == env.get('ENV')) app.disable('verbose errors');

nunjucksEnv.express(app);
nunjucksEnv.addFilter('instantiate', function(input) {
  var tmpl = new nunjucks.Template(input);
  return tmpl.render(this.getVariables());
});

// Setup locales with i18n
app.use(i18n.middleware({
  supported_languages: env.get('SUPPORTED_LANGS'),
  default_lang: 'en-US',
  mappings: require('webmaker-locale-mapping'),
  translation_directory: path.resolve(__dirname, 'locale')
}));

// Static files
app.use(express.static(path.resolve(__dirname, 'public')));

// Boot the application
require('./birdy/Birdy').start(app);

// Localized Strings
app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

// Run server
app.listen(env.get('PORT'), function() {
	console.log('The environment that the server will run is %s', env.get('ENV'));
	console.log('Now listening on %d!', env.get('PORT'));
});