export default class LoggerService {
	static log() {
		for(var argument in arguments) console.info('[Birdy] %s', arguments[argument]);
	}
};
