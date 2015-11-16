'use strict';

// Checkins controller
angular.module('checkins').controller('CheckinsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Checkins',
	function($scope, $stateParams, $location, Authentication, Checkins) {
		$scope.authentication = Authentication;

		// Create new Checkin
		$scope.create = function() {
			// Create new Checkin object
			var checkin = new Checkins ({
				name: this.name
			});

			// Redirect after save
			checkin.$save(function(response) {
				$location.path('checkins/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Checkin
		$scope.remove = function(checkin) {
			if ( checkin ) { 
				checkin.$remove();

				for (var i in $scope.checkins) {
					if ($scope.checkins [i] === checkin) {
						$scope.checkins.splice(i, 1);
					}
				}
			} else {
				$scope.checkin.$remove(function() {
					$location.path('checkins');
				});
			}
		};

		// Update existing Checkin
		$scope.update = function() {
			var checkin = $scope.checkin;

			checkin.$update(function() {
				$location.path('checkins/' + checkin._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Checkins
		$scope.find = function() {
			$scope.checkins = Checkins.query();
		};

		// Find existing Checkin
		$scope.findOne = function() {
			$scope.checkin = Checkins.get({ 
				checkinId: $stateParams.checkinId
			});
		};
	}
]);