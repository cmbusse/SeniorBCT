'use strict';

// TODO:  Determine time zone issues, possibly how to save dates as the correc time zone, or whether its actually an issue or not

angular.module('users').controller('CheckinController', ['$scope', '$http', '$location', 'Authentication', 'Users', 'Children',
	function($scope, $http, $location, Authentication, Users, Children) {
		
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		$scope.user = {};
		$scope.child = {};
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
				console.log('poop');
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
		// Is logged in user an employee
		$scope.loggedInIsEmployee = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'employee';	
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

		$scope.childIsPunchedIn = function(passedchild){
			if(passedchild.isPunchedIn === true){
				return true;
			} else{
				return false;
			}
		};

		$scope.checkChildIn = function(index){
			// TODO:  Set up checks for daycamp mode and auto setting in time as 3:15
			if($scope.usersChildren[index].punchesIn.length === $scope.usersChildren[index].punchesOut.length){
				var dateNow = new Date();
				$scope.usersChildren[index].isPunchedIn = true;
				$scope.usersChildren[index].justCheckedIn = true;
				$scope.usersChildren[index].lastCheckIn = dateNow;
				$scope.usersChildren[index].punchesIn.push(dateNow);
				$scope.usersChildren[index].$update(function(response){
					$scope.usersChildren[index] = response;
				}, function(response){
					$scope.error = response.data.message;
				});
			} else{
				// TODO:  Error Handling
				console.log('bing');
			}
		};

		$scope.checkChildOut = function(index){
			// TODO:  Set up checks for daycamp mode and auto setting in time as 3:15
			if(!$scope.usersChildren[index].dayCampMode){
				var dateNow = new Date();
				var dateNow2 = new Date();
				dateNow.setHours(15);
				dateNow.setMinutes(15);
				dateNow.setSeconds(0);
				$scope.usersChildren[index].punchesIn.push(dateNow);
				$scope.usersChildren[index].punchesOut.push(dateNow2);
				$scope.usersChildren[index].justCheckedOut = true;
				$scope.usersChildren[index].$update(function(response) {
					$scope.usersChildren[index] = response;
					}, function(response) {
						$scope.error = response.data.message;
				});
			} else{
				if($scope.usersChildren[index].punchesIn.length === $scope.usersChildren[index].punchesOut.length+1){
					var dateNow3 = new Date();
					$scope.usersChildren[index].punchesOut.push(dateNow3);
					$scope.usersChildren[index].isPunchedIn = false;
					$scope.usersChildren[index].justCheckedOut = true;
					$scope.usersChildren[index].$update(function(response) {
						$scope.usersChildren[index] = response;
						}, function(response) {
							$scope.error = response.data.message;
					});
				} else{
					// TODO:  Error Handling
					console.log('bing');
				}
			}
		};

		$scope.inBtnControl = function(passedchild){
			if(!passedchild.dayCampMode){
				return true;
			}
			if(passedchild.justCheckedIn || passedchild.justCheckedOut){
				return true;
			}
			return passedchild.isPunchedIn;
		};

		$scope.outBtnControl = function(passedchild){
			if(!passedchild.dayCampMode){
				return true;
			}
			if(passedchild.justCheckedIn || passedchild.justCheckedOut){
				return false;
			}
			return passedchild.isPunchedIn;
		};
		
		$scope.seedChildren = function(){
			$scope.$watch('usersChildren.length',function(newValue, oldValue){
				if(newValue > 0){
					for(var i=0; i<$scope.usersChildren.length; i++){
						$scope.usersChildren[i].justCheckedIn = false;
						$scope.usersChildren[i].justCheckedOut = false;
						$scope.usersChildren[i].$update();
					}
				}
			});
		};

		$scope.justCheckedOut = function(passedchild){
			if(passedchild.justCheckedOut){
				return true;
			}
			return false;
		};
		
		$scope.justCheckedIn = function(passedchild){
			if(passedchild.justCheckedIn){
				return true;
			}
			return false;
		};
	}
]);

/*
On page load call a thing that updates each child's justCheckedIn and justCheckedOut to false
on update change them to what we need to display the successes or failures
*/