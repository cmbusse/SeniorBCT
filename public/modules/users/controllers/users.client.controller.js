'use strict';

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
			if($scope.currentuser){
				return $scope.currentuser.roles[0] === 'admin';	
			}
			else{
				return false;
			}
		};
		
		// Checks to see if a user is an admin
		$scope.isAdmin = function(passeduser){
			if('roles' in passeduser){
				return passeduser.roles[0] === 'admin';
			}
			else{
				return false;
			}
		};
        
		// Checks to see if user is currently logged in
		$scope.isCurrentUser = function(passeduser){
			return passeduser._id === $scope.currentuser._id;
		};

		// Update User
		$scope.test = function(){
			//var currUser = $scope.user;
			$scope.user.roles[0] = 'admin';
			console.log('test');
			//var currUser = $scope.user;
			$scope.user.$updateUserRoles(function() {
				//updated in the backend
			});
			//Users.save(currUser);
		};
	}
]);