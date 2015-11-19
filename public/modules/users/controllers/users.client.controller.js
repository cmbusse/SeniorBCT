'use strict';

angular.module('users').controller('UsersController', ['$scope', '$http', '$rootScope', '$stateParams', '$location', 'Users', 'Authentication',
	function($scope, $http, $rootScope, $stateParams, $location, Users, Authentication) {
		// Current User
		$scope.currentuser = Authentication.user;
		$scope.authentication = Authentication;
		$scope.user = {};
		$scope.users = {};	

		//testing for tabs stuff
		$scope.tabs = [
		    { title:'Dynamic Title 1', content:'Dynamic content 1' },
		    { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
		 ];

		
		//retrieve a list of users in the website
		$scope.findAllUsers = function(){
			$scope.users = Users.query();
		};

		//Retrieve a specific user from the back end
		$scope.findOneUser = function() {
       		var allUsers = Users.query({}, function(){
	       		for(var i=0; i < allUsers.length; i++)
	       		{
	       			var currUser = allUsers[i];
	       			if(currUser._id === $stateParams.userId)
	       			{
	       				$scope.user = currUser;
	       			}
	       		}
        	});
		};
		
		// Is logged in user an admin
		$scope.loggedInIsAdmin = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'admin';	
			}
			else{
				return false;
			}
		};
		
		// Checks to see if a user is an admin
		$scope.isAdmin = function(passeduser){
			if('roles' in passeduser){
				return passeduser.roles === 'admin';
			}
			else{
				return false;
			}
		};
        
		// Checks to see if user is currently logged in
		$scope.isCurrentUser = function(passeduser){
			return passeduser._id === $scope.currentuser._id;
		};

		$scope.isActive = function(passeduser){
			return passeduser.active;
		};

		// Make User Admin
		$scope.makeUserAdmin = function(){
			$scope.user.roles = 'admin';
			$scope.user.$updateUser(function(response) {
				$scope.success = true;
					$scope.user = response;
				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Make Admin User
		$scope.makeAdminUser = function(){
			$scope.user.roles = 'user';
			$scope.user.$updateUser(function(response) {
				$scope.success = true;
					$scope.user = response;
				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Set User's account to Active
		$scope.activateUser = function(){
			$scope.user.active = true;
			$scope.user.$updateUser(function(response) {
				$scope.success = true;
					$scope.user = response;
				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Set User's account to Inactive
		$scope.deactivateUser = function(){
			$scope.user.active = false;
			$scope.user.$updateUser(function(response) {
				$scope.success = true;
					$scope.user = response;
				}, function(response) {
					$scope.error = response.data.message;
			});
		};

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

		$scope.updateGeneralInfo = function(isValid){
			if (isValid) {
				$scope.submittedNoErrors = true;
				$scope.success = $scope.error = null;
				$scope.user.username = $scope.userForm.username.$modelValue;
				$scope.user.$updateUser(function(response) {
					$scope.success = true;
						$scope.user = response;
					}, function(response) {
						$scope.error = response.data.message;
						$scope.submittedNoErrors = false;
				});
				console.log('test');
			} else {
				$scope.submitted = true;
			}
		};
	}
]);