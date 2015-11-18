'use strict';

angular.module('users').controller('CheckinController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;
		var signIn = false;
		var signOut = true;
		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the children/create page
				$location.path('/children/create');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};	

        	 if(signOut === true)
        	 	//This is temporary, leave it until there is a signin field.
        	 	{$scope.signOutDisabled = true;}

if(signOut === true){
    $scope.disableSigninButton = function() {
        	$scope.signOutDisabled = false;
        	 $scope.signInDisabled = true;
        	 signIn = true;
        	 signOut = false;
    };
}
    {
    $scope.disableSignoutButton = function() {
        	$scope.signInDisabled = false;
        	//Re-enable the signin button is we are signed out, we will need this to check the "signed in" field for each child.
        	 $scope.signOutDisabled = true;
        	 signIn = false;
        	 signOut = true;
    };
}
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