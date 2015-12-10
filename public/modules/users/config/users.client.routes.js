'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('success', {
			url: '/success',
			templateUrl: 'modules/users/views/authentication/success.client.view.html'
		}).
		state('edit-user', {
			url: '/users/:userId/edit',
			templateUrl: 'modules/users/views/admin/edit-user.client.view.html'
		}).
		state('childview', {
			url: '/checkin/:userId',
			templateUrl: 'modules/users/views/checkin/childview.client.view.html'
		}).
		state('checkinstatus', {
			url: '/checkin/:userId/status',
			templateUrl: 'modules/users/views/checkin/status.client.view.html'
		}).
		state('view-user', {
			url: '/users/:userId',
			templateUrl: 'modules/users/views/admin/view-user.client.view.html'
		}).
		state('user-view-children', {
			url: '/mychildren',
			templateUrl: 'modules/users/views/user-view-children.client.view.html'
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('list', {
			url: '/dashboard',
			templateUrl: 'modules/users/views/admin/dashboard.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('checkin', {
			url: '/checkin',
			templateUrl: 'modules/users/views/checkin/customersignin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);