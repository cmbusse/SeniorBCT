'use strict';

angular.module('users').controller('UsersController', ['$scope', '$rootScope', '$stateParams', '$location', 'Users', 'Authentication',
	function($scope, $rootScope, $stateParams, $location, Users, Authentication) {
		// Current User
		$scope.user = Authentication.user;	
		// retrieve a list of users in the website
		$scope.users = Users.query();
		// Is logged in user an admin
		$scope.loggedInIsAdmin = false;
		if ($scope.user.roles[0] === 'admin'){
			$scope.loggedInIsAdmin = true;
		}
		
        
		$scope.user2 = Authentication.user;	

	}
]);