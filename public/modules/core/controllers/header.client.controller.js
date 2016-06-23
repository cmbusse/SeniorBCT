'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', 'Users',
	function($scope, Authentication, Menus, Users) {
		// TODO: 	Ween on the home page and not logged in, the header is throwing an error with not being
		//			able to access user.roles[0], probably because user does not exist
		//			Probably not that big of an issue, but throw in some checks so the user.roles[0] isn't 
		//			accessed when not logged in, something like if(user), do the check, etc.
		$scope.authentication = Authentication;
		$scope.currentUser = Authentication.user;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');
		$scope.billHref = '';

		$scope.findCurrentUser = function(){
			$scope.currentUser = Authentication.user;
		};

		$scope.$watch('authentication',function(newValue, oldValue){
 			if($scope.authentication.user){
 				$scope.billHref = '/#!/users/' + $scope.authentication.user._id + '/bill';
 			}
		});
		
		$scope.loggedInIsAdmin = function(){
			if($scope.authentication.user){
				if($scope.billHref === ''){
					$scope.billHref = '/#!/users/' + $scope.authentication.user._id + '/bill';
				}
			}
			return $scope.authentication.user.roles === 'admin';
		};

		$scope.loggedInIsEmployee = function(){
			if($scope.authentication.user){
				if($scope.billHref === ''){
					$scope.billHref = '/#!/users/' + $scope.authentication.user._id + '/bill';
				}
			}
			return $scope.authentication.user.roles === 'employee';
		};
		
		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
		});
	}
]);