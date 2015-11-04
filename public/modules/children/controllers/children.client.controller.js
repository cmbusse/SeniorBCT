'use strict';

// Children controller
angular.module('children').controller('ChildrenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Children', 'Users',
	function($scope, $stateParams, $location, Authentication, Children, Users) {
		$scope.authentication = Authentication;

		// Create new Child
		$scope.create = function() {
			// Create new Child object
			var child = new Children ({
				firstName: this.firstName,
				lastName: this.lastName,
				dob: this.dob,
				timePunches: this.timePunches
			});

			// Redirect after save
			child.$save(function(response) {
				$location.path('children/addmore');

				// Clear form fields
				$scope.firstName = '';
				$scope.lastName = '';
				$scope.dob = '';
				$scope.timePunches = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Child
		$scope.remove = function(child) {
			if ( child ) { 
				child.$remove();

				for (var i in $scope.children) {
					if ($scope.children [i] === child) {
						$scope.children.splice(i, 1);
					}
				}
			} else {
				$scope.child.$remove(function() {
					$location.path('children');
				});
			}
		};

		// Update existing Child
		$scope.update = function() {
			var child = $scope.child;

			child.$update(function() {
				$location.path('children/' + child._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Children
		$scope.find = function() {
			$scope.children = Children.query();
		};

		// Find existing Child
		$scope.findOne = function() {
			$scope.child = Children.get({ 
				childId: $stateParams.childId
			});
		};
	}
]);