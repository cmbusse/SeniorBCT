'use strict';

angular.module('users').controller('CheckinController', ['$scope', '$http', '$location', 'Authentication', 'Users',
	function($scope, $http, $location, Authentication, Users) {
		
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		var signIn = false;
		var signOut = true;

		// Is logged in user an admin
		$scope.loggedInIsAdmin = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'admin';	
			}
			else{
				return false;
			}
		};

		//Retrieve a specific user from the back end
		/*
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
		*/

		// "Sign in" a user
		$scope.signinUser = function(isValid){
			// take PIN, search users for match
			// if no match say "unknown PIN" or something
			// if match, direct to checkin/userId
			// PIN is stord in 'credentials'

			var userID = 'Not Found';

			var allUsers = Users.query({}, function(){
	       		for(var i=0; i < allUsers.length; i++)
	       		{
	       			var currUser = allUsers[i];
	       			if(currUser.PIN === $scope.credentials.PIN)
	       			{
	       				userID = currUser._id;
	       			}
	       		}
        	});
			// Checks for not found

		};

	}
]);