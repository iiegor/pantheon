var d = require('dejavu'),
	emitter = require('component-emitter'),
	utils = require('mout');

var Emitter = d.Class.declare({
	$name: 'EmitterService',

	_emitter: null,

	initialize: function() {
		this._emitter = new emitter();
	},

	emit: function(event) {
		this._emitter.emit(event)
	},

	on: function(event, callback) {
		this._emitter.on(event, callback)
	},

	register: function(events) {
		// Needs a revision
		var event;

		for (event in events) {
			this.on(event, events[event])
		}
	}
});

module.exports = Emitter