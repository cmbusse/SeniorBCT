'use strict';

angular.module('users').controller('UsersController', ['$scope', '$rootScope', '$stateParams', '$location', 'Users', 'Authentication',
	function($scope, $rootScope, $stateParams, $location, Users, Authentication) {
		// Current User
		$scope.currentuser = Authentication.user;	
		
		// retrieve a list of users in the website
		$scope.users = Users.query();
		
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
		}

	}
]);