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

		$scope.checkChildIn = function(childId){
			// TODO:  Set up checks for daycamp mode and auto setting in time as 3:15
			var allChildren = Children.query({}, function(){
				for(var i=0; i < allChildren.length; i++)
	       		{
	       			var currChild = allChildren[i];
	       			if(currChild._id === childId)
	       			{
	       				$scope.child = currChild;
	       			}
	       		}
	       		// If the child has an even number of check ins as check outs, they are good to check in
	       		if($scope.child.punchesIn.length === $scope.child.punchesOut.length){
					var dateNow = new Date();
		       		$scope.child.punchesIn[$scope.child.punchesIn.length] = dateNow;
		       		$scope.child.isPunchedIn = true;
		       		$scope.child.lastCheckIn = dateNow;
	        		console.log('test');
	        		$scope.child.inToOut = true;
	        		$scope.child.$update(function(response) {
	        			console.log('bing');
	        			$scope.child = response;
	        			}, function(response) {
	        				$scope.error = response.data.message;
	        		});
	       		} else{
	       			// TODO:  Error handling
	       			console.log('bing');
	       		}

        	});
		};

		$scope.checkChildOut = function(childId){
			// TODO:  Set up checks for daycamp mode and auto setting in time as 3:15
			var allChildren = Children.query({}, function(){
				for(var i=0; i < allChildren.length; i++)
	       		{
	       			var currChild = allChildren[i];
	       			if(currChild._id === childId)
	       			{
	       				$scope.child = currChild;
	       			}
	       		}
	       		if(!$scope.child.dayCampMode){
	       			var dateNow = new Date();
	       			var dateNow2 = new Date();
	       			dateNow.setHours(15);
	       			dateNow.setMinutes(15);
	       			dateNow.setSeconds(0);
	       			$scope.child.punchesIn.push(dateNow);
	       			$scope.child.punchesOut.push(dateNow2);
	       			$scope.child.$update(function(response) {
	        			console.log('bing');
	        			$scope.child = response;
	        			}, function(response) {
	        				$scope.error = response.data.message;
	        		});
	       		} else{
	       			// If the child has an even number of check ins as check outs, they are good to check in
		       		if($scope.child.punchesIn.length === ($scope.child.punchesOut.length+1)){
						var dateNow3 = new Date();
			       		$scope.child.punchesOut.push(dateNow3);
			       		$scope.child.isPunchedIn = false;
		        		console.log('test');
		        		$scope.child.$update(function(response) {
		        			console.log('bing');
		        			$scope.child = response;
		        			}, function(response) {
		        				$scope.error = response.data.message;
		        		});
		       		} else{
		       			// TODO:  Error handling
		       			console.log('bing');
		       		}
		       	}
        	});
		};

		$scope.inBtnControl = function(passedchild){
			if(!passedchild.dayCampMode){
				return true;
			}
			return passedchild.isPunchedIn;
		};

		$scope.outBtnControl = function(passedchild){
			if(!passedchild.dayCampMode){
				return true;
			}
			return passedchild.isPunchedIn;
		};

		$scope.inToOutTrue = function(passedchild){
			/* For latchkey mode
			Watch the passedchild.isPunchedIn
			When old value === false, newvalue === true
			return true for "displayCheckInSuccess(passedchild)"
			*/
			return passedchild.inToOut;

		};
	}
]);