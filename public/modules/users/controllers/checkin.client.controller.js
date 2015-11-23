'use strict';

angular.module('users').controller('CheckinController', ['$scope', '$http', '$location', 'Authentication', 'Users',
	function($scope, $http, $location, Authentication, Users) {
		
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		$scope.user = {};
		var signIn = false;
		var signOut = true;
		var path = $location.path();
		// TODO:  If length > /checkin/ then crop path to a var as usersId, use that to find $scope.user()
		console.log('test');

		// Is logged in user an admin
		$scope.loggedInIsAdmin = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'admin';	
			}
			else{
				return false;
			}
		};

		// "Sign in" a user
		$scope.signinUser = function(isValid){
			// take PIN, search users for match
			// if no match say "unknown PIN" or something
			// if match, direct to checkin/userId
			// PIN is stord in 'credentials'

			var userID = 'Not Found';
			$scope.PINnotFound = false;

			var allUsers = Users.query({}, function(){
	       		for(var i=0; i < allUsers.length; i++)
	       		{
	       			var currUser = allUsers[i];
	       			if(currUser.PIN === $scope.credentials.PIN)
	       			{
	       				userID = currUser._id;
	       				$scope.user = currUser;
	       			}
	       		}
	       		if(userID === 'Not Found'){
	       			$scope.PINnotFound = true;
	       		} else{
	       			$location.path('/checkin/' + (userID));
	       		}	       		
        	});
		};
	}
]);