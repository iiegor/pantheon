import d from 'dejavu';
import Router from './router'

export default d.AbstractClass.declare({
	$name: 'Controller',

	_router: null,
	_services: null,

	initialize: function(router) {
		if (!d.instanceOf(router, Router)) {
            throw new Error('Controller \'' + this.$name + '\' was not initialized correctly');
        }

		this._router = router;
		this._services = router.services;
	},

	log: function() {
		console.log('loggin')
	}
});
