'use strict';

// Children controller
angular.module('children').controller('ChildrenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Children', 'Users',
	function($scope, $stateParams, $location, Authentication, Children, Users) {
		$scope.authentication = Authentication;

		// Create new Child
		$scope.create = function() {
			// Create new Child object
			// TODO:  Actually add in PIN creation here
			// Basically when adding a child, check if PIN === 'No Pin'
			//  If it is, do the pin assignment shown below, will need a users resource to work with
			/*
				// PIN Setting
		        var testPIN = 0;
		        var PINFound = false;

		        var i = 0;
		        do{
		          // Format the PIN so it is 4 digits
		          testPIN = ("000" + i).slice(-4);
		            // Check the PIN against every user in users for matches
		            for(var j = 0; j < $scope.users.length; j++){
		              // If the PIN matches a user, move on to the next try
		              if($scope.users[j].PIN === testPIN){
		                break;
		              }
		              // If we have checked it against every user and there were no matches
		              // we have found a good PIN
		              if(j === ($scope.users.length-1)){
		                PINFound = true;
		              }
		            }
		            i++;
		        }
		        while (i < 9999 && PINFound != true)
			*/
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