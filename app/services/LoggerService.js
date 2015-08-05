export default class LoggerService {
	log() {
		for(var argument in arguments) console.info(`[Birdy] ${arguments[argument]}`)
	}
}