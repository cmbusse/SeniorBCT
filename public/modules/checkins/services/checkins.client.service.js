'use strict';

//Checkins service used to communicate Checkins REST endpoints
angular.module('checkins').factory('Checkins', ['$resource',
	function($resource) {
		return $resource('checkins/:checkinId', { checkinId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);