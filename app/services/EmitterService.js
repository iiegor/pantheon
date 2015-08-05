import emitter from 'component-emitter'
import mout from 'mout'

export default class EmitterService {

	constructor() {
		this._emitter = new emitter()
	}

	emit(event) {
		this._emitter.emit(event)
	}

	on(event, callback) {
		if(!callback) throw new Error('You must define an action for the event "' + event + '"')

		this._emitter.on(event, callback)
	}

	register(events) {
		// If not array break
		if(!mout.lang.isArray(events)) throw new Error('Parameter "events" must be an array.')

		// Needs a revision
		var event;

		for (event in events) {
			this.on(event, events[event])
		}
	}

}
