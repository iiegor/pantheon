import d from 'dejavu';

export default d.Class.declare({
	$name: 'LoggerService',

	log() {
		for(var argument in arguments) console.info('[Birdy] %s', arguments[argument]);
	}
});
