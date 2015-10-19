'use strict';

// Admins controller
angular.module('admins').controller('AdminsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admins',
	function($scope, $stateParams, $location, Authentication, Admins) {
		$scope.authentication = Authentication;

		// Create new Admin
		$scope.create = function() {
			// Create new Admin object
			var admin = new Admins ({
				name: this.name
			});

			// Redirect after save
			admin.$save(function(response) {
				$location.path('admins/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Admin
		$scope.remove = function(admin) {
			if ( admin ) { 
				admin.$remove();

				for (var i in $scope.admins) {
					if ($scope.admins [i] === admin) {
						$scope.admins.splice(i, 1);
					}
				}
			} else {
				$scope.admin.$remove(function() {
					$location.path('admins');
				});
			}
		};

		// Update existing Admin
		$scope.update = function() {
			var admin = $scope.admin;

			admin.$update(function() {
				$location.path('admins/' + admin._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Admins
		$scope.find = function() {
			$scope.admins = Admins.query();
		};

		// Find existing Admin
		$scope.findOne = function() {
			$scope.admin = Admins.get({ 
				adminId: $stateParams.adminId
			});
		};
	}
]);