'use strict';

angular.module('users').controller('UsersController', ['$scope', '$http', '$rootScope', '$stateParams', '$location', 'Users', 'Authentication', 'Children',
	function($scope, $http, $rootScope, $stateParams, $location, Users, Authentication, Children) {
		// Current User
		$scope.currentuser = Authentication.user;
		$scope.authentication = Authentication;
		$scope.user = {};
		$scope.users = {};	
		$scope.children = {};
		$scope.usersChildren = {};
		
		//retrieve a list of users in the website
		$scope.findAllUsers = function(){
			$scope.users = Users.query();
		};

		$scope.findAllChildren = function(){
			$scope.children = Children.query();
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

		//Retrieve an array of children that are associated with a user
		$scope.findUsersChildren = function(){
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

		//Retrieve an array of children that are associated with a user
		$scope.findThisUsersChildren = function(){
			var usersChildren = [];

			var allChildren = Children.query({}, function(){
				var userid = $scope.currentuser._id;
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

		$scope.seedOrderBy = function(){
			$scope.orderByUsers = 'lastName';
			$scope.orderByChildren = 'lastName';
		};

		$scope.setOrderByUsers = function(order){
			$scope.orderByUsers = order;
		};

		$scope.setOrderByChildren = function(order){
			$scope.orderByChildren = order;
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

		// Is logged in user an employee
		$scope.loggedInIsEmployee = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'employee';	
			}
			else{
				return false;
			}
		};

		// Is there a user logged in
		$scope.isLoggedIn = function(){
			if($scope.currentuser){
				return true;
			} else{
				return false;
			}
		};
		
		// Checks to see if a user is an admin
		$scope.isAdmin = function(passeduser){
			if('roles' in passeduser){
				return passeduser.roles === 'admin';
			}
			else{
				return false;
			}
		};
		// Checks to see if a user is an employee
		$scope.isEmployee = function(passeduser){
			if('roles' in passeduser){
				return passeduser.roles === 'employee';
			}
			else{
				return false;
			}
		};
        
        
		// Checks to see if user is currently logged in
		$scope.isCurrentUser = function(passeduser){
			return passeduser._id === $scope.currentuser._id;
		};

		$scope.isActive = function(passeduser){
			return passeduser.active;
		};

		$scope.isPunchedIn = function(passedchild){
			return passedchild.isPunchedIn;
		};

		$scope.parentIsActive = function(passedchild){
			if($scope.users){
				for(var i=0; i < $scope.users.length; i++){
					var currUser = $scope.users[i];
					if(currUser._id === passedchild.user._id){
						return currUser.active;
					}
				}
			}
		};

		// Make User Admin
		$scope.makeUserAdmin = function(){
			$scope.user.roles = 'admin';
			$scope.user.$updateUser(function(response) {

				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Make Admin Employee
		$scope.makeAdminUser = function(){
			$scope.user.roles = 'user';
			$scope.user.$updateUser(function(response) {

				}, function(response) {
					$scope.error = response.data.message;
			});
		};
		//Make Active User Employee
		$scope.makeUserEmployee = function(){
			$scope.user.roles = 'employee';
			$scope.user.$updateUser(function(response) {

				}, function(response) {
					$scope.error = response.data.message;
			});
		};
		//Make Employee User
		$scope.makeEmployeeUser = function(){
			$scope.user.roles = 'user';
			$scope.user.$updateUser(function(response) {

				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Set User's account to Active
		$scope.activateUser = function(){
			$scope.user.active = true;
			$scope.user.$updateUser(function(response) {
				$scope.success = true;
				$scope.user = response;
				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Set User's account to Inactive
		$scope.deactivateUser = function(){
			$scope.user.active = false;
			$scope.user.$updateUser(function(response) {
				$scope.success = true;
				$scope.user = response;
				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		$scope.updateGeneralInfo = function(isValid){
			if (isValid) {
				$scope.success1 = $scope.error1 = null;
				$scope.user.$updateUser(function(response) {
					$scope.success1 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error1 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted1 = true;
			}
		};

		$scope.updateUsername = function(isValid){
			if (isValid) {
				$scope.success2 = $scope.error2 = null;
				$scope.user.$updateUser(function(response) {
					$scope.success2 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error2 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted2 = true;
			}
		};

		$scope.updateEmail = function(isValid){
			if (isValid) {
				$scope.success3 = $scope.error3 = null;
				$scope.user.$updateUser(function(response) {
					$scope.success3 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error3 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted3 = true;
			}
		};

		$scope.updatePIN = function(isValid){
			if (isValid) {
				$scope.success4 = $scope.error4 = null;
				$scope.user.$updateUser(function(response) {
					$scope.success4 = true;
					$scope.user = response;
					}, function(response) {
						$scope.error4 = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted4 = true;
			}
		};

		$scope.determineBillingMode = function(){
			$scope.$watch('children.$resolved',function(newValue, oldValue){
				if(newValue === true){
					$scope.dayCampMode = $scope.children[0].dayCampMode;
				}
			});
		};

		$scope.setToDayCamp = function(){
			$scope.dayCampMode = true;
			for(var i=0; i<$scope.children.length; i++){
				$scope.children[i].dayCampMode = true;
				$scope.children[i].$update();
				console.log('test');
			}
		};

		$scope.setToLatchKey = function(){
			$scope.dayCampMode = false;
			for(var i=0; i<$scope.children.length; i++){
				$scope.children[i].dayCampMode = false;
				$scope.children[i].$update();
				console.log('test');
			}
		};
		
	}
]);