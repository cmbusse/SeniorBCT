'use strict';

//Admins service used to communicate Admins REST endpoints
angular.module('admins').factory('Admins', ['$resource',
	function($resource) {
		return $resource('admins/:adminId', { adminId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);