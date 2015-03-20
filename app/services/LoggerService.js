var d = require('dejavu');

var Logger = d.Class.declare({
	$name: 'LoggerService',

	log: function() {
		for(var argument in arguments) console.info('[Birdy] %s', arguments[argument]);
	}
});

module.exports = Logger