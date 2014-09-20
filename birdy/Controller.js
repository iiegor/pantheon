var d = require('dejavu'),
	Router = require('./Router');

var Controller = d.AbstractClass.declare({
	$name: 'Controller',

	_router: null,

	initialize: function(router) {
		if (!d.instanceOf(router, Router)) {
            throw new Error('Controller \'' + this.$name + '\' was not initialized correctly');
        }

		this._router = router;
	}
});

module.exports = Controller;