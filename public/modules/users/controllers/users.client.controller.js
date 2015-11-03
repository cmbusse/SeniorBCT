'use strict';

//possibly should split controllers

angular.module('users').controller('UsersController', ['$scope', '$http', '$rootScope', '$stateParams', '$location', 'Users', 'Authentication',
	function($scope, $http, $rootScope, $stateParams, $location, Users, Authentication) {
		// Current User
		$scope.currentuser = Authentication.user;
		$scope.authentication = Authentication;
		$scope.user = {};
		$scope.users = {};	
		
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
			return $scope.currentuser.roles[0] === 'admin';
		};
		
		// Checks to see if a user is an admin
		$scope.isAdmin = function(user){
			return user.roles[0] === 'admin';
		};
        
		// Checks to see if user is currently logged in
		$scope.isCurrentUser = function(user){
			return user._id === $scope.currentuser._id;
		};

		// Update User
		$scope.test = function(){
			$scope.user.roles[0]= 'admin';
			console.log('test');
			var currUser = $scope.user;
			//Users.updateUserRoles(currUser);
			Users.save(currUser);
		};
	}
]);