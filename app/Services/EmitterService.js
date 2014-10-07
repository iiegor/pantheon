var d = require('dejavu'),
	emitter = require('component-emitter'),
	mout = require('mout');

var Emitter = d.Class.declare({
	$name: 'EmitterService',

	_emitter: null,

	initialize: function() {
		this._emitter = new emitter();
	},

	emit: function(event) {
		this._emitter.emit(event);
	},

	on: function(event, callback) {
		if(!callback) throw new Error('You must define an action for the event "' + event + '"');

		this._emitter.on(event, callback);
	},

	register: function(events) {
		// If not array break
		if(!mout.lang.isArray(events)) throw new Error('Parameter "events" must be an array.');

		// Needs a revision
		var event;

		for (event in events) {
			this.on(event, events[event]);
		}
	}
});

module.exports = Emitter