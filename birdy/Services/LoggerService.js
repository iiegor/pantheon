var Logger = Logger || {};

Logger.log = function(string) {
	console.info('[Birdy] %s', string);
}

module.exports = Logger