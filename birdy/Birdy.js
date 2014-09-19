/*
 * Birdy
 */
var Birdy = Birdy || {};
Birdy.logger = require('./Services/LoggerService');

Birdy.start = function(app) {
	require('./Router')(app);

	Birdy._bootServices();
}

Birdy._bootServices = function() {
	
}

exports.start = Birdy.start;