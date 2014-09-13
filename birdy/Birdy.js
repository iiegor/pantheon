/*
 * Birdy
 */
var Birdy = Birdy || {};
Birdy.logger = require('./Services/LoggerService');

Birdy.start = function(app) {
	require('./Router')(app);
}

exports.start = Birdy.start;