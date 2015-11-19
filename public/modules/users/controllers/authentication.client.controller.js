'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'Users',
	function($scope, $http, $location, Authentication, Users) {
		$scope.authentication = Authentication;
		$scope.users = {};

		//retrieve a list of users in the website
		$scope.findAllUsers = function(){
			$scope.users = Users.query();
		};	

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {			
			// PIN Setting
	        var testPIN = 0;
	        var PINFound = false;

	        var i = 0;
	        do{
	          // Format the PIN so it is 4 digits
	          testPIN = ('000' + i).slice(-4);
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
	        while (i < 9999 && PINFound !== true);
			
			$scope.credentials.PIN = testPIN;
			console.log('test in signup');
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the children/create page
				//$location.path('/children/create');
				$location.path('/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);