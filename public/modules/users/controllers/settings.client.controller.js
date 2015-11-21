'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		/*
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};
		*/

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.updateGeneralInfo = function(isValid){
			if (isValid) {
				$scope.success1 = $scope.error1 = null;
				var user = new Users($scope.user);
				user.$update(function(response) {
					$scope.success1 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error1 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted1 = true;
			}
		};

		$scope.updateUsername = function(isValid){
			if (isValid) {
				$scope.success2 = $scope.error2 = null;
				var user = new Users($scope.user);
				user.$update(function(response) {
					$scope.success2 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error2 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted2 = true;
			}
		};

		$scope.updateEmail = function(isValid){
			if (isValid) {
				$scope.success3 = $scope.error3 = null;
				var user = new Users($scope.user);
				user.$update(function(response) {
					$scope.success3 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error3 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted3 = true;
			}
		};

		$scope.updatePIN = function(isValid){
			if (isValid) {
				$scope.success4 = $scope.error4 = null;
				var user = new Users($scope.user);
				user.$update(function(response) {
					$scope.success4 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error4 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted4 = true;
			}
		};
	}
]);