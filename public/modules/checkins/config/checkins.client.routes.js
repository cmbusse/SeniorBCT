'use strict';

//Setting up route
angular.module('checkins').config(['$stateProvider',
	function($stateProvider) {
		// Checkins state routing
		$stateProvider.
		state('listCheckins', {
			url: '/checkins',
			templateUrl: 'modules/checkins/views/list-checkins.client.view.html'
		}).
		state('createCheckin', {
			url: '/checkins/create',
			templateUrl: 'modules/checkins/views/create-checkin.client.view.html'
		}).
		state('viewCheckin', {
			url: '/checkins/:checkinId',
			templateUrl: 'modules/checkins/views/view-checkin.client.view.html'
		}).
		state('editCheckin', {
			url: '/checkins/:checkinId/edit',
			templateUrl: 'modules/checkins/views/edit-checkin.client.view.html'
		});
	}
]);