'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users/', {}, {
			updateUserRoles: {
				method: 'PUT',
				url: 'users/:id',
				params: {id: '@_id'}
			},
			update: {
				method: 'PUT'
			}		
		});
	}
]);