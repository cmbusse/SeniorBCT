'use strict';

// Children controller
angular.module('children').controller('ChildrenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Children', 'Users',
	function($scope, $stateParams, $location, Authentication, Children, Users) {
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		$scope.usersChildren = {};
		$scope.newestChild = {};

		// Create new Child
		$scope.create = function() {
			// Create new Child object
			var child = new Children ({
				firstName: this.firstName,
				lastName: this.lastName,
				dob: this.dob,
				timePunches: this.timePunches,
				parentLastName: $scope.currentuser.lastName,
				parentFirstName: $scope.currentuser.firstName

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

		// Is logged in user admin
		$scope.loggedInIsAdmin = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'admin';	
			}
			else{
				return false;
			}
		};

		// Must be admin or child's parent to view child
		$scope.authorizedToViewChild = function() {
			if($scope.child){
				if($scope.currentuser.roles === 'admin'){
					return true;
				} else if($scope.currentuser._id === $scope.child.user._id){
					return true;
				} else{
					return false;
				}
			}
			return false;
		};

		$scope.isPunchedIn = function(passedchild){
			return passedchild.isPunchedIn;
		};

		//Retrieve an array of children that are associated with a user
		$scope.findUsersChildren = function(){
			var usersChildren = [];

			var allChildren = Children.query({}, function(){
				var userid = $scope.currentuser._id;
				for(var i=0; i < allChildren.length; i++)
	       		{
	       			var currChild = allChildren[i];
	       			if(currChild.user._id === userid)
	       			{
	       				usersChildren.push(currChild);
	       			}
	       		}
	       		$scope.newestChild = usersChildren[0];
        	});
		};

		$scope.updateChild = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				$scope.child.$update(function(response) {
					$scope.success = true;
					$scope.child = response;
					}, function(response) {
						$scope.error = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted = true;
			}
		};
	}
]);