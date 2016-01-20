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
		$scope.billHref = '/#!/mychildren';

		$scope.findCurrentUser = function(){
			$scope.currentUser = Authentication.user;
		};

		$scope.$watch('currentUser',function(newValue, oldValue){
			$scope.billHref = '/#!/users/' + $scope.currentUser._id + '/bill';
		});
		
		$scope.loggedInIsAdmin = function(){
			return $scope.authentication.user.roles === 'admin';
		};

		$scope.loggedInIsEmployee = function(){
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