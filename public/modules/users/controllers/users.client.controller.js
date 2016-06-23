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
	       			var parentID = -1;
	       			if(currChild.user !== null){
		       			parentID = currChild.user._id;	
		       		}
		       		if(parentID === userid){
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
	       			var parentID = -1;
	       			if(currChild.user !== null){
		       			parentID = currChild.user._id;	
		       		}
		       		if(parentID === userid){
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
		// Test to see if is root child so not displayed
		$scope.isRootChild = function(passedchild){
			return passedchild.rootChild;
		};

		// do location path see if user id = path thing and if so authorized to view, that or admin or employee
		$scope.authToViewBill = function(){
			var path = $location.path();
			var thisUserID = path.slice(7,path.length);
			thisUserID = thisUserID.slice(0,thisUserID.length-5);
			if(thisUserID === $scope.currentuser._id || $scope.currentuser.roles === 'admin' || $scope.currentuser.roles === 'employee'){
				return true;
			} else {
				return false;
			}
		};

		$scope.seedBill = function(){
			var d = new Date();
			$scope.monTimeIn = $scope.monTimeOut = $scope.tueTimeIn = $scope.tueTimeOut = $scope.wedTimeIn = $scope.wedTimeOut = $scope.thuTimeIn = $scope.thuTimeOut = $scope.friTimeIn = $scope.friTimeOut = $scope.satTimeIn = $scope.satTimeOut = $scope.sunTimeIn = $scope.sunTimeOut = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
			$scope.monDayCampMode = $scope.tueDayCampMode = $scope.wedDayCampMode = $scope.thuDayCampMode = $scope.friDayCampMode = $scope.satDayCampMode = $scope.sunDayCampMode = null;
			var day = d.getDay();
			var diff = d.getDate() - day + (day === 0 ? -6:1);
			$scope.weekOfDate = $scope.thisMonday = $scope.monDate = new Date(d.setDate(diff));
			$scope.scopeDiff = $scope.thisMonday.getDate();
			$scope.tueDate = new Date(d.setDate(d.getDate()+1));
			$scope.wedDate = new Date(d.setDate(d.getDate()+1));
			$scope.thuDate = new Date(d.setDate(d.getDate()+1));
			$scope.friDate = new Date(d.setDate(d.getDate()+1));
			$scope.satDate = new Date(d.setDate(d.getDate()+1));
			$scope.sunDate = new Date(d.setDate(d.getDate()+1));
			timeBuilder();
		};

		$scope.backOneWeek = function(){
			$scope.scopeDiff -= 7;
			var d = new Date($scope.thisMonday);
			d.setDate($scope.scopeDiff);
			$scope.weekOfDate = $scope.monDate = new Date(d);
			$scope.tueDate = new Date(d.setDate(d.getDate()+1));
			$scope.wedDate = new Date(d.setDate(d.getDate()+1));
			$scope.thuDate = new Date(d.setDate(d.getDate()+1));
			$scope.friDate = new Date(d.setDate(d.getDate()+1));
			$scope.satDate = new Date(d.setDate(d.getDate()+1));
			$scope.sunDate = new Date(d.setDate(d.getDate()+1));
			timeBuilder();
		};

		$scope.forwardOneWeek = function(){
			$scope.scopeDiff += 7;
			var d = new Date($scope.thisMonday);
			d.setDate($scope.scopeDiff);
			$scope.weekOfDate = $scope.monDate = new Date(d);
			$scope.tueDate = new Date(d.setDate(d.getDate()+1));
			$scope.wedDate = new Date(d.setDate(d.getDate()+1));
			$scope.thuDate = new Date(d.setDate(d.getDate()+1));
			$scope.friDate = new Date(d.setDate(d.getDate()+1));
			$scope.satDate = new Date(d.setDate(d.getDate()+1));
			$scope.sunDate = new Date(d.setDate(d.getDate()+1));
			timeBuilder();
		};

		$scope.buildBill = function(){
			$scope.$watch('usersChildren.length',function(newValue, oldValue){
				if(newValue > 0){
					timeBuilder();
				}
			});
		};

		$scope.setupBill = function(){
			

			var path = $location.path();
			var thisUserID = path.slice(7,path.length);
			thisUserID = thisUserID.slice(0,thisUserID.length-5);

			var usersChildren = [];

			var allChildren = Children.query({}, function(){
				var userid = thisUserID;
				for(var i=0; i < allChildren.length; i++)
	       		{
	       			var currChild = allChildren[i];
	       			var parentID = -1;
	       			if(currChild.user !== null){
		       			parentID = currChild.user._id;	
		       		}
		       		if(parentID === userid){
		       			usersChildren.push(currChild);
		       		}
	       		}
	       		$scope.usersChildren = usersChildren;
        	});

        	var allUsers = Users.query({}, function(){
	       		for(var i=0; i < allUsers.length; i++)
	       		{
	       			var currUser = allUsers[i];
	       			if(currUser._id === thisUserID)
	       			{
	       				$scope.billUser = currUser;
	       			}
	       		}
        	});

        	$scope.seedBill();
			$scope.buildBill();
		};

		function timeBuilder(){
			$scope.usersBill = 0;
			var punchesIn;
			var punchesOut;
			var d;
			var i;
			var time = 1000 * 60 * 15;
			// Temp date to hold todays date with day's in / out time
			var tempInTime = new Date();
			var tempOutTime = new Date();
			// 3:15 PM constant start time for latch key
			var lkStart = new Date();
			lkStart.setHours(15);
			lkStart.setMinutes(15);
			lkStart.setSeconds(0);
			// 9:00 AM 
			var dcStart = new Date();
			dcStart.setHours(9);
			dcStart.setMinutes(0);
			dcStart.setSeconds(0);
			// 3:00 PM 
			var dcEnd = new Date();
			dcEnd.setHours(15);
			dcEnd.setMinutes(0);
			dcEnd.setSeconds(0);
			for(var j=0; j<$scope.usersChildren.length; j++){
				punchesIn = $scope.usersChildren[j].punchesIn;
				punchesOut = $scope.usersChildren[j].punchesOut;
				$scope.monDayCampMode = null;
				$scope.tueDayCampMode = null;
				$scope.wedDayCampMode = null;
				$scope.thuDayCampMode = null;
				$scope.friDayCampMode = null;
				$scope.satDayCampMode = null;
				$scope.sunDayCampMode = null;
				$scope.monBill = 0;
				$scope.tueBill = 0;
				$scope.wedBill = 0;
				$scope.thuBill = 0;
				$scope.friBill = 0;
				$scope.satBill = 0;
				$scope.sunBill = 0;
				$scope.totalBill = 0;

				// build Monday Times
				var monDate = $scope.monDate;
				var monInFound = false;
				var monOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === monDate.getDate()){
						if(d.getMonth() === monDate.getMonth()){
							if(d.getFullYear() === monDate.getFullYear()){
								$scope.monInDisplay = d;
								$scope.monIn = $scope.usersChildren[j].punchesIn[i];
								$scope.monDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								monInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === monDate.getDate()){
						if(d.getMonth() === monDate.getMonth()){
							if(d.getFullYear() === monDate.getFullYear()){
								$scope.monOutDisplay = d;
								$scope.monOut = $scope.usersChildren[j].punchesOut[i];
								monOutFound = true;
							}
						}
					}
				}
				if(!monInFound){
					$scope.monIn = 'N/A';
					$scope.monInDisplay = 'N/A';
				}
				if(!monOutFound){
					$scope.monOut = 'N/A';
					$scope.monOutDisplay = 'N/A';
				}
				if($scope.monInDisplay === 'N/A' || $scope.monOutDisplay === 'N/A'){
					$scope.monTotal = 'N/A';
				} else{
					$scope.monTotal = $scope.monOutDisplay - $scope.monInDisplay;
					// If we are in latch key mode and properly checked in at 3:15PM
					if($scope.monIn.dayCampMode === false && $scope.monInDisplay.getHours() === 15 && $scope.monInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.monOutDisplay.getHours());
						tempOutTime.setMinutes($scope.monOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.monOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var monMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var monRoundedUp = Math.round(monMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.monBill = monRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.monIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.monInDisplay.getHours());
						tempInTime.setMinutes($scope.monInDisplay.getMinutes());
						tempInTime.setSeconds($scope.monInDisplay.getSeconds());
						tempOutTime.setHours($scope.monOutDisplay.getHours());
						tempOutTime.setMinutes($scope.monOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.monOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var monMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var monMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var monRoundedDown = Math.round(monMinutesBefore/15);
						var monRoundedUp2 = Math.round(monMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.monBill = monRoundedDown * 0.5 + monRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// build tuesday Times
				var tueDate = $scope.tueDate;
				var tueInFound = false;
				var tueOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === tueDate.getDate()){
						if(d.getMonth() === tueDate.getMonth()){
							if(d.getFullYear() === tueDate.getFullYear()){
								$scope.tueInDisplay = d;
								$scope.tueIn = $scope.usersChildren[j].punchesIn[i];
								$scope.tueDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								tueInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === tueDate.getDate()){
						if(d.getMonth() === tueDate.getMonth()){
							if(d.getFullYear() === tueDate.getFullYear()){
								$scope.tueOutDisplay = d;
								$scope.tueOut = $scope.usersChildren[j].punchesOut[i];
								tueOutFound = true;
							}
						}
					}
				}
				if(!tueInFound){
					$scope.tueIn = 'N/A';
					$scope.tueInDisplay = 'N/A';
				}
				if(!tueOutFound){
					$scope.tueOut = 'N/A';
					$scope.tueOutDisplay = 'N/A';
				}
				if($scope.tueInDisplay === 'N/A' || $scope.tueOutDisplay === 'N/A'){
					$scope.tueTotal = 'N/A';
				} else{
					$scope.tueTotal = $scope.tueOutDisplay - $scope.tueInDisplay;
					if($scope.tueIn.dayCampMode === false && $scope.tueInDisplay.getHours() === 15 && $scope.tueInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.tueOutDisplay.getHours());
						tempOutTime.setMinutes($scope.tueOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.tueOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var tueMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var tueRoundedUp = Math.round(tueMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.tueBill = tueRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.tueIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.tueInDisplay.getHours());
						tempInTime.setMinutes($scope.tueInDisplay.getMinutes());
						tempInTime.setSeconds($scope.tueInDisplay.getSeconds());
						tempOutTime.setHours($scope.tueOutDisplay.getHours());
						tempOutTime.setMinutes($scope.tueOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.tueOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var tueMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var tueMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var tueRoundedDown = Math.round(tueMinutesBefore/15);
						var tueRoundedUp2 = Math.round(tueMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.tueBill = tueRoundedDown * 0.5 + tueRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// build wednesday Times
				var wedDate = $scope.wedDate;
				var wedInFound = false;
				var wedOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === wedDate.getDate()){
						if(d.getMonth() === wedDate.getMonth()){
							if(d.getFullYear() === wedDate.getFullYear()){
								$scope.wedIn = $scope.usersChildren[j].punchesIn[i];
								$scope.wedInDisplay = d;
								$scope.wedDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								wedInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === wedDate.getDate()){
						if(d.getMonth() === wedDate.getMonth()){
							if(d.getFullYear() === wedDate.getFullYear()){
								$scope.wedOut = $scope.usersChildren[j].punchesOut[i];
								$scope.wedOutDisplay = d;
								wedOutFound = true;
							}
						}
					}
				}
				if(!wedInFound){
					$scope.wedInDisplay = 'N/A';
					$scope.wedIn = 'N/A';
				}
				if(!wedOutFound){
					$scope.wedOutDisplay = 'N/A';
					$scope.wedOut = 'N/A';
				}
				if($scope.wedInDisplay === 'N/A' || $scope.wedOutDisplay === 'N/A'){
					$scope.wedTotal = 'N/A';
				} else{
					$scope.wedTotal = $scope.wedOutDisplay - $scope.wedInDisplay;
					// If we are in latch key mode and properly checked in at 3:15PM
					if($scope.wedIn.dayCampMode === false && $scope.wedInDisplay.getHours() === 15 && $scope.wedInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.wedOutDisplay.getHours());
						tempOutTime.setMinutes($scope.wedOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.wedOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var wedMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var wedRoundedUp = Math.round(wedMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.wedBill = wedRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.wedIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.wedInDisplay.getHours());
						tempInTime.setMinutes($scope.wedInDisplay.getMinutes());
						tempInTime.setSeconds($scope.wedInDisplay.getSeconds());
						tempOutTime.setHours($scope.wedOutDisplay.getHours());
						tempOutTime.setMinutes($scope.wedOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.wedOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var wedMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var wedMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var wedRoundedDown = Math.round(wedMinutesBefore/15);
						var wedRoundedUp2 = Math.round(wedMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.wedBill = wedRoundedDown * 0.5 + wedRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// build thursday Times
				var thuDate = $scope.thuDate;
				var thuInFound = false;
				var thuOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === thuDate.getDate()){
						if(d.getMonth() === thuDate.getMonth()){
							if(d.getFullYear() === thuDate.getFullYear()){
								$scope.thuIn = $scope.usersChildren[j].punchesIn[i];
								$scope.thuInDisplay = d;
								$scope.thuDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								thuInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === thuDate.getDate()){
						if(d.getMonth() === thuDate.getMonth()){
							if(d.getFullYear() === thuDate.getFullYear()){
								$scope.thuOut = $scope.usersChildren[j].punchesOut[i];
								$scope.thuOutDisplay = d;
								thuOutFound = true;
							}
						}
					}
				}
				if(!thuInFound){
					$scope.thuInDisplay = 'N/A';
					$scope.thuIn = 'N/A';
				}
				if(!thuOutFound){
					$scope.thuOutDisplay = 'N/A';
					$scope.thuOut = 'N/A';
				}
				if($scope.thuInDisplay === 'N/A' || $scope.thuOutDisplay === 'N/A'){
					$scope.thuTotal = 'N/A';
				} else{
					$scope.thuTotal = $scope.thuOutDisplay - $scope.thuInDisplay;
					// If we are in latch key mode and properly checked in at 3:15PM
					if($scope.thuIn.dayCampMode === false && $scope.thuInDisplay.getHours() === 15 && $scope.thuInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.thuOutDisplay.getHours());
						tempOutTime.setMinutes($scope.thuOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.thuOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var thuMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var thuRoundedUp = Math.round(thuMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.thuBill = thuRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.thuIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.thuInDisplay.getHours());
						tempInTime.setMinutes($scope.thuInDisplay.getMinutes());
						tempInTime.setSeconds($scope.thuInDisplay.getSeconds());
						tempOutTime.setHours($scope.thuOutDisplay.getHours());
						tempOutTime.setMinutes($scope.thuOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.thuOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var thuMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var thuMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var thuRoundedDown = Math.round(thuMinutesBefore/15);
						var thuRoundedUp2 = Math.round(thuMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.thuBill = thuRoundedDown * 0.5 + thuRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// build friday Times
				var friDate = $scope.friDate;
				var friInFound = false;
				var friOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === friDate.getDate()){
						if(d.getMonth() === friDate.getMonth()){
							if(d.getFullYear() === friDate.getFullYear()){
								$scope.friIn = $scope.usersChildren[j].punchesIn[i];
								$scope.friInDisplay = d;
								$scope.friDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								friInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === friDate.getDate()){
						if(d.getMonth() === friDate.getMonth()){
							if(d.getFullYear() === friDate.getFullYear()){
								$scope.friOut = $scope.usersChildren[j].punchesOut[i];
								$scope.friOutDisplay = d;
								friOutFound = true;
							}
						}
					}
				}
				if(!friInFound){
					$scope.friInDisplay = 'N/A';
					$scope.friIn = 'N/A';
				}
				if(!friOutFound){
					$scope.friOutDisplay = 'N/A';
					$scope.friOut = 'N/A';
				}
				if($scope.friInDisplay === 'N/A' || $scope.friOutDisplay === 'N/A'){
					$scope.friTotal = 'N/A';
				} else{
					$scope.friTotal = $scope.friOutDisplay - $scope.friInDisplay;
					// If we are in latch key mode and properly checked in at 3:15PM
					if($scope.friIn.dayCampMode === false && $scope.friInDisplay.getHours() === 15 && $scope.friInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.friOutDisplay.getHours());
						tempOutTime.setMinutes($scope.friOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.friOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var friMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var friRoundedUp = Math.round(friMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.friBill = friRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.friIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.friInDisplay.getHours());
						tempInTime.setMinutes($scope.friInDisplay.getMinutes());
						tempInTime.setSeconds($scope.friInDisplay.getSeconds());
						tempOutTime.setHours($scope.friOutDisplay.getHours());
						tempOutTime.setMinutes($scope.friOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.friOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var friMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var friMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var friRoundedDown = Math.round(friMinutesBefore/15);
						var friRoundedUp2 = Math.round(friMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.friBill = friRoundedDown * 0.5 + friRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// build saturday Times
				var satDate = $scope.satDate;
				var satInFound = false;
				var satOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === satDate.getDate()){
						if(d.getMonth() === satDate.getMonth()){
							if(d.getFullYear() === satDate.getFullYear()){
								$scope.satIn = $scope.usersChildren[j].punchesIn[i];
								$scope.satInDisplay = d;
								$scope.satDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								satInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === satDate.getDate()){
						if(d.getMonth() === satDate.getMonth()){
							if(d.getFullYear() === satDate.getFullYear()){
								$scope.satOut = $scope.usersChildren[j].punchesOut[i];
								$scope.satOutDisplay = d;
								satOutFound = true;
							}
						}
					}
				}
				if(!satInFound){
					$scope.satInDisplay = 'N/A';
					$scope.satIn = 'N/A';
				}
				if(!satOutFound){
					$scope.satOutDisplay = 'N/A';
					$scope.satOut = 'N/A';
				}
				if($scope.satInDisplay === 'N/A' || $scope.satOutDisplay === 'N/A'){
					$scope.satTotal = 'N/A';
				} else{
					$scope.satTotal = $scope.satOutDisplay - $scope.satInDisplay;
					// If we are in latch key mode and properly checked in at 3:15PM
					if($scope.satIn.dayCampMode === false && $scope.satInDisplay.getHours() === 15 && $scope.satInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.satOutDisplay.getHours());
						tempOutTime.setMinutes($scope.satOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.satOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var satMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var satRoundedUp = Math.round(satMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.satBill = satRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.satIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.satInDisplay.getHours());
						tempInTime.setMinutes($scope.satInDisplay.getMinutes());
						tempInTime.setSeconds($scope.satInDisplay.getSeconds());
						tempOutTime.setHours($scope.satOutDisplay.getHours());
						tempOutTime.setMinutes($scope.satOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.satOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var satMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var satMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var satRoundedDown = Math.round(satMinutesBefore/15);
						var satRoundedUp2 = Math.round(satMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.satBill = satRoundedDown * 0.5 + satRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// build sunday Times
				var sunDate = $scope.sunDate;
				var sunInFound = false;
				var sunOutFound = false;
				for(i=0; i<punchesIn.length; i++){
					d = new Date($scope.usersChildren[j].punchesIn[i].punch);
					if(d.getDate() === sunDate.getDate()){
						if(d.getMonth() === sunDate.getMonth()){
							if(d.getFullYear() === sunDate.getFullYear()){
								$scope.sunIn = $scope.usersChildren[j].punchesIn[i];
								$scope.sunInDisplay = d;
								$scope.sunDayCampMode = $scope.usersChildren[j].punchesIn[i].dayCampMode;
								sunInFound = true;
							}
						}
					}
				}
				for(i=0; i<punchesOut.length; i++){
					d = new Date($scope.usersChildren[j].punchesOut[i].punch);
					if(d.getDate() === sunDate.getDate()){
						if(d.getMonth() === sunDate.getMonth()){
							if(d.getFullYear() === sunDate.getFullYear()){
								$scope.sunOut = $scope.usersChildren[j].punchesOut[i];
								$scope.sunOutDisplay = d;
								sunOutFound = true;
							}
						}
					}
				}
				if(!sunInFound){
					$scope.sunInDisplay = 'N/A';
					$scope.sunIn = 'N/A';
				}
				if(!sunOutFound){
					$scope.sunOutDisplay = 'N/A';
					$scope.sunOut = 'N/A';
				}
				if($scope.sunInDisplay === 'N/A' || $scope.sunOutDisplay === 'N/A'){
					$scope.sunTotal = 'N/A';
				} else{
					$scope.sunTotal = $scope.sunOutDisplay - $scope.sunInDisplay;
					// If we are in latch key mode and properly checked in at 3:15PM
					if($scope.sunIn.dayCampMode === false && $scope.sunInDisplay.getHours() === 15 && $scope.sunInDisplay.getMinutes() === 15){
						// tempOutTime and lkStart have same Dates but proper times
						tempOutTime.setHours($scope.sunOutDisplay.getHours());
						tempOutTime.setMinutes($scope.sunOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.sunOutDisplay.getSeconds());
						// Calculate the number of minutes on clock, add 7 so that Math.round will properly round Up to the nearest quarter hour
						var sunMinutesAfter = (tempOutTime - lkStart)/1000/60 + 7;
						// Round up to nearest quarter hour
						var sunRoundedUp = Math.round(sunMinutesAfter/15);
						// Store number of quarter hours times 50 cents as monBill
						$scope.sunBill = sunRoundedUp * 0.5;
						console.log('test');
					}
					else if($scope.sunIn.dayCampMode === true){
						// Set Temp in/out to day's in and out times, with dates of today/dcStart and dcEnd
						tempInTime.setHours($scope.sunInDisplay.getHours());
						tempInTime.setMinutes($scope.sunInDisplay.getMinutes());
						tempInTime.setSeconds($scope.sunInDisplay.getSeconds());
						tempOutTime.setHours($scope.sunOutDisplay.getHours());
						tempOutTime.setMinutes($scope.sunOutDisplay.getMinutes());
						tempOutTime.setSeconds($scope.sunOutDisplay.getSeconds());
						// Calculate the numbers of minutes on clock
						var sunMinutesBefore = (dcStart - tempInTime)/1000/60 + 7;
						var sunMinutesAfter2 = (tempOutTime - dcEnd)/1000/60 + 7;
						// Round time before down to nearest 1/4 hour
						var sunRoundedDown = Math.round(sunMinutesBefore/15);
						var sunRoundedUp2 = Math.round(sunMinutesAfter2/15);
						// Add hourly charges to hourly scope variable
						$scope.sunBill = sunRoundedDown * 0.5 + sunRoundedUp2 * 0.5;
						console.log('test');
					}
				}
				// If one day is on day camp mode, use the day camp feature, otherwise use latch key pricing
				var useLatchKey = true;
				if($scope.monInDisplay !== 'N/A' && $scope.monIn.dayCampMode === true){
					useLatchKey = false;
				}
				if($scope.tueInDisplay !== 'N/A' && $scope.tueIn.dayCampMode === true){
					useLatchKey = false;
				}
				if($scope.wedInDisplay !== 'N/A' && $scope.wedIn.dayCampMode === true){
					useLatchKey = false;
				}
				if($scope.thuInDisplay !== 'N/A' && $scope.thuIn.dayCampMode === true){
					useLatchKey = false;
				}
				if($scope.friInDisplay !== 'N/A' && $scope.friIn.dayCampMode === true){
					useLatchKey = false;
				}
				// Latchkey pricing for total bill
				if(useLatchKey){
					$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill;
					$scope.usersBill += $scope.totalBill;
					console.log('text');
				}
				// Figure out number of days attended to see if getting the weekly rate discount
				else {
					var dayCount = 0;
					if($scope.monInDisplay !== 'N/A'){
						dayCount++;
					}
					if($scope.tueInDisplay !== 'N/A'){
						dayCount++;
					}
					if($scope.wedInDisplay !== 'N/A'){
						dayCount++;
					}
					if($scope.thuInDisplay !== 'N/A'){
						dayCount++;
					}
					if($scope.friInDisplay !== 'N/A'){
						dayCount++;
					}
					// If usersChildren[j] attended every day in the week use weekly pricing model
					if(dayCount === 5){
						// If the usersChildren[j] applies for the in city rate
						if($scope.usersChildren[j].inCity){
							$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + 45;
							$scope.usersBill += $scope.totalBill;
							console.log('text');
						}
						// If the usersChildren[j] doesn't apply for the in city rate
						if(!$scope.usersChildren[j].inCity){
							$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + 50;
							$scope.usersBill += $scope.totalBill;
							console.log('text');
						}
					}
					// If usersChildren[j] attended less than 5 days use daily pricing model
					else{
						if($scope.usersChildren[j].inCity){
							$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + dayCount * 11;
							$scope.usersBill += $scope.totalBill;
							console.log('text');
						}
						// If the usersChildren[j] doesn't apply for the in city rate
						if(!$scope.usersChildren[j].inCity){
							$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + dayCount * 13;
							$scope.usersBill += $scope.totalBill;
							console.log('text');
						}
					}
				}
			}
		}
	}
]);