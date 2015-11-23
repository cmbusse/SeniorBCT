'use strict';

angular.module('users').controller('CheckinController', ['$scope', '$http', '$location', 'Authentication', 'Users', 'Children',
	function($scope, $http, $location, Authentication, Users, Children) {
		
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		$scope.user = {};
		$scope.usersChildren = {};
		var signIn = false;
		var signOut = true;

		// Extracting User ID from URL and setting the "signed in" user to scope.user
		$scope.extractUser = function(){
			var path = $location.path();
			var checkInUserID;
			if(path.length > 9){
				checkInUserID = path.slice(9,path.length);
			}

			var allUsers = Users.query({}, function(){
	       		for(var i=0; i < allUsers.length; i++)
	       		{
	       			var currUser = allUsers[i];
	       			if(currUser._id === checkInUserID)
	       			{
	       				$scope.user = currUser;
	       			}
	       		}    		
        	});
		};

		// Retrieve an arry of children that are associated with a user
		$scope.findUsersChildren = function(){
			// Make each entry an array/object
			// Make the first part the child object
			// Make the second part a boolean for checked in
			var usersChildren = [];

			var allChildren = Children.query({}, function(){
				var userid = $scope.user._id;
				for(var i=0; i < allChildren.length; i++)
	       		{
	       			var currChild = allChildren[i];
	       			if(currChild.user._id === userid)
	       			{
	       				usersChildren.push(currChild);
	       			}
	       		}
	       		$scope.usersChildren = usersChildren;
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

		// "Sign in" a user
		$scope.signinUser = function(isValid){
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