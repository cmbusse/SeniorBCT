'use strict';

//Setting up route
angular.module('admin').config(['$stateProvider',
	function($stateProvider) {
		// Admin state routing
		$stateProvider.
		state('dashboard', {
			url: '/dashboard',
			templateUrl: 'modules/admin/views/dashboard.client.view.html'
		});
	}
]);