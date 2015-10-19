'use strict';

//Setting up route
angular.module('admins').config(['$stateProvider',
	function($stateProvider) {
		// Admins state routing
		$stateProvider.
		state('listAdmins', {
			url: '/admins',
			templateUrl: 'modules/admins/views/list-admins.client.view.html'
		}).
		state('createAdmin', {
			url: '/admins/create',
			templateUrl: 'modules/admins/views/create-admin.client.view.html'
		}).
		state('viewAdmin', {
			url: '/admins/:adminId',
			templateUrl: 'modules/admins/views/view-admin.client.view.html'
		}).
		state('editAdmin', {
			url: '/admins/:adminId/edit',
			templateUrl: 'modules/admins/views/edit-admin.client.view.html'
		});
	}
]);