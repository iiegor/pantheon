var d = require('dejavu');

var Logger = d.Class.declare({
	$name: 'LoggerService',

	log: function(str) {
		console.info('[Birdy] %s', str);
	}
});

module.exports = Logger