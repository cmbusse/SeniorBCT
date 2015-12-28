'use strict';

// TODO:  Make it so if a child has been checked in already that day, they can't be checked in again, should be one of the last we do so we can keep testing
// TODO:  Make it so that the admin editing the time punch should select a billing mode for that day when editing, have it default to the child's current dayCampMode, but changeable

// Children controller
angular.module('children').controller('ChildrenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Children', 'Users',
	function($scope, $stateParams, $location, Authentication, Children, Users) {
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		$scope.usersChildren = {};
		$scope.newestChild = {};

		// Create new Child
		$scope.create = function() {
			// Create new Child object
			var child = new Children ({
				firstName: this.firstName,
				lastName: this.lastName,
				dob: this.dob,
				timePunches: this.timePunches,
				parentLastName: $scope.currentuser.lastName,
				parentFirstName: $scope.currentuser.firstName,
				dayCampMode: $scope.children[0].dayCampMode
			});

			// Redirect after save
			child.$save(function(response) {
				$location.path('children/addmore');
				// Clear form fields
				$scope.firstName = '';
				$scope.lastName = '';
				$scope.dob = '';
				$scope.timePunches = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Child
		$scope.remove = function(child) {
			if ( child ) { 
				child.$remove();

				for (var i in $scope.children) {
					if ($scope.children [i] === child) {
						$scope.children.splice(i, 1);
					}
				}
			} else {
				$scope.child.$remove(function() {
					$location.path('children');
				});
			}
		};

		// Update existing Child
		$scope.update = function() {
			var child = $scope.child;

			child.$update(function() {
				$location.path('children/' + child._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Children
		$scope.find = function() {
			$scope.children = Children.query();
		};

		// Find existing Child
		$scope.findOne = function() {
			$scope.child = Children.get({ 
				childId: $stateParams.childId
			});
		};

		// Is logged in user admin
		$scope.loggedInIsAdmin = function(){
			if($scope.currentuser){
				return $scope.currentuser.roles === 'admin';	
			}
			else{
				return false;
			}
		};

		// Must be admin or child's parent to view child
		$scope.authorizedToViewChild = function() {
			if($scope.child){
				if($scope.currentuser.roles === 'admin'){
					return true;
				}
				if($scope.currentuser.roles === 'employee'){
					return true;
				} else if($scope.currentuser._id === $scope.child.user._id){
					return true;
				} 
				else{
					return false;
				}
			}
			return false;
		};

		$scope.isPunchedIn = function(passedchild){
			return passedchild.isPunchedIn;
		};

		//Retrieve an array of children that are associated with a user
		$scope.findUsersChildren = function(){
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
	       		$scope.newestChild = usersChildren[0];
        	});
		};

		$scope.updateChild = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				$scope.child.$update(function(response) {
					$scope.success = true;
					$scope.child = response;
					}, function(response) {
						$scope.error = response.data.message;
				});
				console.log('test');
			} else {
				$scope.submitted = true;
			}
		};

		$scope.seedWeekView = function(){
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
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
		};

		function timeBuilder(){
			var punchesIn = $scope.child.punchesIn;
			var punchesOut = $scope.child.punchesOut;
			var d;
			var i;
			$scope.monDayCampMode = null;
			$scope.tueDayCampMode = null;
			$scope.wedDayCampMode = null;
			$scope.thuDayCampMode = null;
			$scope.friDayCampMode = null;
			$scope.satDayCampMode = null;
			$scope.sunDayCampMode = null;

			// build Monday Times
			var monDate = $scope.monDate;
			var monInFound = false;
			var monOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === monDate.getDate()){
					if(d.getMonth() === monDate.getMonth()){
						if(d.getFullYear() === monDate.getFullYear()){
							$scope.monInDisplay = d;
							$scope.monIn = $scope.child.punchesIn[i];
							$scope.monDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							monInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === monDate.getDate()){
					if(d.getMonth() === monDate.getMonth()){
						if(d.getFullYear() === monDate.getFullYear()){
							$scope.monOutDisplay = d;
							$scope.monOut = $scope.child.punchesOut[i];
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
			}
			// build tuesday Times
			var tueDate = $scope.tueDate;
			var tueInFound = false;
			var tueOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === tueDate.getDate()){
					if(d.getMonth() === tueDate.getMonth()){
						if(d.getFullYear() === tueDate.getFullYear()){
							$scope.tueIn = d;
							$scope.tueDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							tueInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === tueDate.getDate()){
					if(d.getMonth() === tueDate.getMonth()){
						if(d.getFullYear() === tueDate.getFullYear()){
							$scope.tueOut = d;
							tueOutFound = true;
						}
					}
				}
			}
			if(!tueInFound){
				$scope.tueIn = 'N/A';
			}
			if(!tueOutFound){
				$scope.tueOut = 'N/A';
			}
			if($scope.tueIn === 'N/A' || $scope.tueOut === 'N/A'){
				$scope.tueTotal = 'N/A';
			} else{
				$scope.tueTotal = $scope.tueOut - $scope.tueIn;
			}
			// build wednesday Times
			var wedDate = $scope.wedDate;
			var wedInFound = false;
			var wedOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === wedDate.getDate()){
					if(d.getMonth() === wedDate.getMonth()){
						if(d.getFullYear() === wedDate.getFullYear()){
							$scope.wedIn = d;
							$scope.wedDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							wedInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === wedDate.getDate()){
					if(d.getMonth() === wedDate.getMonth()){
						if(d.getFullYear() === wedDate.getFullYear()){
							$scope.wedOut = d;
							wedOutFound = true;
						}
					}
				}
			}
			if(!wedInFound){
				$scope.wedIn = 'N/A';
			}
			if(!wedOutFound){
				$scope.wedOut = 'N/A';
			}
			if($scope.wedIn === 'N/A' || $scope.wedOut === 'N/A'){
				$scope.wedTotal = 'N/A';
			} else{
				$scope.wedTotal = $scope.wedOut - $scope.wedIn;
			}
			// build thursday Times
			var thuDate = $scope.thuDate;
			var thuInFound = false;
			var thuOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === thuDate.getDate()){
					if(d.getMonth() === thuDate.getMonth()){
						if(d.getFullYear() === thuDate.getFullYear()){
							$scope.thuIn = d;
							$scope.thuDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							thuInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === thuDate.getDate()){
					if(d.getMonth() === thuDate.getMonth()){
						if(d.getFullYear() === thuDate.getFullYear()){
							$scope.thuOut = d;
							thuOutFound = true;
						}
					}
				}
			}
			if(!thuInFound){
				$scope.thuIn = 'N/A';
			}
			if(!thuOutFound){
				$scope.thuOut = 'N/A';
			}
			if($scope.thuIn === 'N/A' || $scope.thuOut === 'N/A'){
				$scope.thuTotal = 'N/A';
			} else{
				$scope.thuTotal = $scope.thuOut - $scope.thuIn;
			}
			// build friday Times
			var friDate = $scope.friDate;
			var friInFound = false;
			var friOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === friDate.getDate()){
					if(d.getMonth() === friDate.getMonth()){
						if(d.getFullYear() === friDate.getFullYear()){
							$scope.friIn = d;
							$scope.friDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							friInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === friDate.getDate()){
					if(d.getMonth() === friDate.getMonth()){
						if(d.getFullYear() === friDate.getFullYear()){
							$scope.friOut = d;
							friOutFound = true;
						}
					}
				}
			}
			if(!friInFound){
				$scope.friIn = 'N/A';
			}
			if(!friOutFound){
				$scope.friOut = 'N/A';
			}
			if($scope.friIn === 'N/A' || $scope.friOut === 'N/A'){
				$scope.friTotal = 'N/A';
			} else{
				$scope.friTotal = $scope.friOut - $scope.friIn;
			}
			// build saturday Times
			var satDate = $scope.satDate;
			var satInFound = false;
			var satOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === satDate.getDate()){
					if(d.getMonth() === satDate.getMonth()){
						if(d.getFullYear() === satDate.getFullYear()){
							$scope.satIn = d;
							$scope.satDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							satInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === satDate.getDate()){
					if(d.getMonth() === satDate.getMonth()){
						if(d.getFullYear() === satDate.getFullYear()){
							$scope.satOut = d;
							satOutFound = true;
						}
					}
				}
			}
			if(!satInFound){
				$scope.satIn = 'N/A';
			}
			if(!satOutFound){
				$scope.satOut = 'N/A';
			}
			if($scope.satIn === 'N/A' || $scope.satOut === 'N/A'){
				$scope.satTotal = 'N/A';
			} else{
				$scope.satTotal = $scope.satOut - $scope.satIn;
			}
			// build sunday Times
			var sunDate = $scope.sunDate;
			var sunInFound = false;
			var sunOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === sunDate.getDate()){
					if(d.getMonth() === sunDate.getMonth()){
						if(d.getFullYear() === sunDate.getFullYear()){
							$scope.sunIn = d;
							$scope.sunDayCampMode = $scope.child.punchesIn[i].dayCampMode;
							sunInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				d = new Date($scope.child.punchesOut[i].punch);
				if(d.getDate() === sunDate.getDate()){
					if(d.getMonth() === sunDate.getMonth()){
						if(d.getFullYear() === sunDate.getFullYear()){
							$scope.sunOut = d;
							sunOutFound = true;
						}
					}
				}
			}
			if(!sunInFound){
				$scope.sunIn = 'N/A';
			}
			if(!sunOutFound){
				$scope.sunOut = 'N/A';
			}
			if($scope.sunIn === 'N/A' || $scope.sunOut === 'N/A'){
				$scope.sunTotal = 'N/A';
			} else{
				$scope.sunTotal = $scope.sunOut - $scope.sunIn;
			}
		}

		$scope.buildTimes = function(){
			$scope.$watch('child.$resolved',function(newValue, oldValue){
				if(newValue === true){
					timeBuilder();
				}
			});
		};

		$scope.fixDate = function(){
			$scope.$watch('child.$resolved',function(newValue, oldValue){
				if(newValue === true){
					$scope.child.dob = new Date($scope.child.dob);
				}
			});
		};

		$scope.backOneWeek = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
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
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
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

		$scope.editMonday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.monEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null;
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.monIn === 'N/A'){
				var d = new Date();
				$scope.monTimeIn = new Date($scope.monDate.getFullYear(), $scope.monDate.getMonth(), $scope.monDate.getDate(), d.getHours(), d.getMinutes());
				$scope.monDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.monIn.punch);
				$scope.monTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.monDayCampMode = $scope.monIn.dayCampMode;
			}
			if($scope.monOut === 'N/A'){
				var d2 = new Date();
				$scope.monTimeOut = new Date($scope.monDate.getFullYear(), $scope.monDate.getMonth(), $scope.monDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.monOut.punch);
				$scope.monTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
			}
		};

		$scope.cancelEditMonday = function(){
			$scope.monEdit = false;
			$scope.error1 = null;
			$scope.success1 = null;
		};

		$scope.editMondayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.monTimeIn.getHours() < $scope.monTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.monTimeIn.getHours() === $scope.monTimeOut.getHours()){
						if($scope.monTimeIn.getMinutes() < $scope.monTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.monTimeIn.getHours() === $scope.monTimeOut.getHours()){
					if($scope.monTimeIn.getMinutes() === $scope.monTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.monTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.monTimeIn.getFullYear() === today.getFullYear()){
					if($scope.monTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.monTimeIn.getMonth() === today.getMonth()){
						if($scope.monTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.monTimeIn.getDate()){
							if(d.getMonth() === $scope.monTimeIn.getMonth()){
								if(d.getFullYear() === $scope.monTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.monTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.monTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.monTimeOut.getDate()){
							if(d2.getMonth() === $scope.monTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.monTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.monTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.monTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success1 = $scope.error1 = null;
					$scope.child.$update(function(response) {
						$scope.success1 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error1 = response.data.message;
					});
					$scope.monEdit = false;
					$scope.$watch('success1',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error1 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error1 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.editTuesday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.tueEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null; 
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.tueIn === 'N/A'){
				var d = new Date();
				$scope.tueTimeIn = new Date($scope.tueDate.getFullYear(), $scope.tueDate.getMonth(), $scope.tueDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.tueTimeIn = new Date($scope.tueIn.getFullYear(), $scope.tueIn.getMonth(), $scope.tueIn.getDate(), $scope.tueIn.getHours(), $scope.tueIn.getMinutes());
			}
			if($scope.tueOut === 'N/A'){
				var d2 = new Date();
				$scope.tueTimeOut = new Date($scope.tueDate.getFullYear(), $scope.tueDate.getMonth(), $scope.tueDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.tueTimeOut = new Date($scope.tueOut.getFullYear(), $scope.tueOut.getMonth(), $scope.tueOut.getDate(), $scope.tueOut.getHours(), $scope.tueOut.getMinutes());
			}
		};

		$scope.cancelEditTuesday = function(){
			$scope.tueEdit = false;
			$scope.error2 = null;
			$scope.success2 = null;
		};

		$scope.editTuesdayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.tueTimeIn.getHours() < $scope.tueTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.tueTimeIn.getHours() === $scope.tueTimeOut.getHours()){
						if($scope.tueTimeIn.getMinutes() < $scope.tueTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.tueTimeIn.getHours() === $scope.tueTimeOut.getHours()){
					if($scope.tueTimeIn.getMinutes() === $scope.tueTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.tueTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.tueTimeIn.getFullYear() === today.getFullYear()){
					if($scope.tueTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.tueTimeIn.getMonth() === today.getMonth()){
						if($scope.tueTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.tueTimeIn.getDate()){
							if(d.getMonth() === $scope.tueTimeIn.getMonth()){
								if(d.getFullYear() === $scope.tueTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.tueTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.tueTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.tueTimeOut.getDate()){
							if(d2.getMonth() === $scope.tueTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.tueTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.tueTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.tueTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success2 = $scope.error2 = null;
					$scope.child.$update(function(response) {
						$scope.success2 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error2 = response.data.message;
					});
					$scope.tueEdit = false;
					$scope.$watch('success2',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error2 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error2 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.editWednesday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.wedEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null; 
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.wedIn === 'N/A'){
				var d = new Date();
				$scope.wedTimeIn = new Date($scope.wedDate.getFullYear(), $scope.wedDate.getMonth(), $scope.wedDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.wedTimeIn = new Date($scope.wedIn.getFullYear(), $scope.wedIn.getMonth(), $scope.wedIn.getDate(), $scope.wedIn.getHours(), $scope.wedIn.getMinutes());
			}
			if($scope.wedOut === 'N/A'){
				var d2 = new Date();
				$scope.wedTimeOut = new Date($scope.wedDate.getFullYear(), $scope.wedDate.getMonth(), $scope.wedDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.wedTimeOut = new Date($scope.wedOut.getFullYear(), $scope.wedOut.getMonth(), $scope.wedOut.getDate(), $scope.wedOut.getHours(), $scope.wedOut.getMinutes());
			}
		};

		$scope.cancelEditWednesday = function(){
			$scope.wedEdit = false;
			$scope.error3 = null;
			$scope.success3 = null;
		};

		$scope.editWednesdayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.wedTimeIn.getHours() < $scope.wedTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.wedTimeIn.getHours() === $scope.wedTimeOut.getHours()){
						if($scope.wedTimeIn.getMinutes() < $scope.wedTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.wedTimeIn.getHours() === $scope.wedTimeOut.getHours()){
					if($scope.wedTimeIn.getMinutes() === $scope.wedTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.wedTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.wedTimeIn.getFullYear() === today.getFullYear()){
					if($scope.wedTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.wedTimeIn.getMonth() === today.getMonth()){
						if($scope.wedTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.wedTimeIn.getDate()){
							if(d.getMonth() === $scope.wedTimeIn.getMonth()){
								if(d.getFullYear() === $scope.wedTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.wedTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.wedTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.wedTimeOut.getDate()){
							if(d2.getMonth() === $scope.wedTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.wedTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.wedTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.wedTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success3 = $scope.error3 = null;
					$scope.child.$update(function(response) {
						$scope.success3 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error3 = response.data.message;
					});
					$scope.wedEdit = false;
					$scope.$watch('success3',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error3 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error3 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.editThursday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.thuEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null; 
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.thuIn === 'N/A'){
				var d = new Date();
				$scope.thuTimeIn = new Date($scope.thuDate.getFullYear(), $scope.thuDate.getMonth(), $scope.thuDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.thuTimeIn = new Date($scope.thuIn.getFullYear(), $scope.thuIn.getMonth(), $scope.thuIn.getDate(), $scope.thuIn.getHours(), $scope.thuIn.getMinutes());
			}
			if($scope.thuOut === 'N/A'){
				var d2 = new Date();
				$scope.thuTimeOut = new Date($scope.thuDate.getFullYear(), $scope.thuDate.getMonth(), $scope.thuDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.thuTimeOut = new Date($scope.thuOut.getFullYear(), $scope.thuOut.getMonth(), $scope.thuOut.getDate(), $scope.thuOut.getHours(), $scope.thuOut.getMinutes());
			}
		};

		$scope.cancelEditThursday = function(){
			$scope.thuEdit = false;
			$scope.error4 = null;
			$scope.success4 = null;
		};

		$scope.editThursdayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.thuTimeIn.getHours() < $scope.thuTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.thuTimeIn.getHours() === $scope.thuTimeOut.getHours()){
						if($scope.thuTimeIn.getMinutes() < $scope.thuTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.thuTimeIn.getHours() === $scope.thuTimeOut.getHours()){
					if($scope.thuTimeIn.getMinutes() === $scope.thuTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.thuTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.thuTimeIn.getFullYear() === today.getFullYear()){
					if($scope.thuTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.thuTimeIn.getMonth() === today.getMonth()){
						if($scope.thuTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.thuTimeIn.getDate()){
							if(d.getMonth() === $scope.thuTimeIn.getMonth()){
								if(d.getFullYear() === $scope.thuTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.thuTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.thuTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.thuTimeOut.getDate()){
							if(d2.getMonth() === $scope.thuTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.thuTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.thuTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.thuTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success4 = $scope.error4 = null;
					$scope.child.$update(function(response) {
						$scope.success4 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error4 = response.data.message;
					});
					$scope.thuEdit = false;
					$scope.$watch('success4',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error4 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error4 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.editFriday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.friEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null; 
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.friIn === 'N/A'){
				var d = new Date();
				$scope.friTimeIn = new Date($scope.friDate.getFullYear(), $scope.friDate.getMonth(), $scope.friDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.friTimeIn = new Date($scope.friIn.getFullYear(), $scope.friIn.getMonth(), $scope.friIn.getDate(), $scope.friIn.getHours(), $scope.friIn.getMinutes());
			}
			if($scope.friOut === 'N/A'){
				var d2 = new Date();
				$scope.friTimeOut = new Date($scope.friDate.getFullYear(), $scope.friDate.getMonth(), $scope.friDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.friTimeOut = new Date($scope.friOut.getFullYear(), $scope.friOut.getMonth(), $scope.friOut.getDate(), $scope.friOut.getHours(), $scope.friOut.getMinutes());
			}
		};

		$scope.cancelEditFriday = function(){
			$scope.friEdit = false;
			$scope.error5 = null;
			$scope.success5 = null;
		};

		$scope.editFridayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.friTimeIn.getHours() < $scope.friTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.friTimeIn.getHours() === $scope.friTimeOut.getHours()){
						if($scope.friTimeIn.getMinutes() < $scope.friTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.friTimeIn.getHours() === $scope.friTimeOut.getHours()){
					if($scope.friTimeIn.getMinutes() === $scope.friTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.friTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.friTimeIn.getFullYear() === today.getFullYear()){
					if($scope.friTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.friTimeIn.getMonth() === today.getMonth()){
						if($scope.friTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.friTimeIn.getDate()){
							if(d.getMonth() === $scope.friTimeIn.getMonth()){
								if(d.getFullYear() === $scope.friTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.friTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.friTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.friTimeOut.getDate()){
							if(d2.getMonth() === $scope.friTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.friTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.friTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.friTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success5 = $scope.error5 = null;
					$scope.child.$update(function(response) {
						$scope.success5 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error5 = response.data.message;
					});
					$scope.friEdit = false;
					$scope.$watch('success5',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error5 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error5 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.editSaturday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.satEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null; 
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.satIn === 'N/A'){
				var d = new Date();
				$scope.satTimeIn = new Date($scope.satDate.getFullYear(), $scope.satDate.getMonth(), $scope.satDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.satTimeIn = new Date($scope.satIn.getFullYear(), $scope.satIn.getMonth(), $scope.satIn.getDate(), $scope.satIn.getHours(), $scope.satIn.getMinutes());
			}
			if($scope.satOut === 'N/A'){
				var d2 = new Date();
				$scope.satTimeOut = new Date($scope.satDate.getFullYear(), $scope.satDate.getMonth(), $scope.satDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.satTimeOut = new Date($scope.satOut.getFullYear(), $scope.satOut.getMonth(), $scope.satOut.getDate(), $scope.satOut.getHours(), $scope.satOut.getMinutes());
			}
		};

		$scope.cancelEditSaturday = function(){
			$scope.satEdit = false;
			$scope.error6 = null;
			$scope.success6 = null;
		};

		$scope.editSaturdayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.satTimeIn.getHours() < $scope.satTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.satTimeIn.getHours() === $scope.satTimeOut.getHours()){
						if($scope.satTimeIn.getMinutes() < $scope.satTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.satTimeIn.getHours() === $scope.satTimeOut.getHours()){
					if($scope.satTimeIn.getMinutes() === $scope.satTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.satTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.satTimeIn.getFullYear() === today.getFullYear()){
					if($scope.satTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.satTimeIn.getMonth() === today.getMonth()){
						if($scope.satTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.satTimeIn.getDate()){
							if(d.getMonth() === $scope.satTimeIn.getMonth()){
								if(d.getFullYear() === $scope.satTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.satTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.satTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.satTimeOut.getDate()){
							if(d2.getMonth() === $scope.satTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.satTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.satTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.satTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success6 = $scope.error6 = null;
					$scope.child.$update(function(response) {
						$scope.success6 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error6 = response.data.message;
					});
					$scope.satEdit = false;
					$scope.$watch('success6',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error6 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error6 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.editSunday = function(){
			$scope.monEdit = $scope.tueEdit = $scope.wedEdit = $scope.thuEdit = $scope.friEdit = $scope.satEdit = $scope.sunEdit = false;
			$scope.sunEdit = true;
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null; 
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
			if($scope.sunIn === 'N/A'){
				var d = new Date();
				$scope.sunTimeIn = new Date($scope.sunDate.getFullYear(), $scope.sunDate.getMonth(), $scope.sunDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.sunTimeIn = new Date($scope.sunIn.getFullYear(), $scope.sunIn.getMonth(), $scope.sunIn.getDate(), $scope.sunIn.getHours(), $scope.sunIn.getMinutes());
			}
			if($scope.sunOut === 'N/A'){
				var d2 = new Date();
				$scope.sunTimeOut = new Date($scope.sunDate.getFullYear(), $scope.sunDate.getMonth(), $scope.sunDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.sunTimeOut = new Date($scope.sunOut.getFullYear(), $scope.sunOut.getMonth(), $scope.sunOut.getDate(), $scope.sunOut.getHours(), $scope.sunOut.getMinutes());
			}
		};

		$scope.cancelEditSunday = function(){
			$scope.sunEdit = false;
			$scope.error7 = null;
			$scope.success7 = null;
		};

		$scope.editSundayTimes = function(isValid){
			if(isValid){
				var timesValid = false;
				var isFuture = false;
				var today = new Date();
				if($scope.sunTimeIn.getHours() < $scope.sunTimeOut.getHours()){
					timesValid = true;
				}
				if(!timesValid){
					if($scope.sunTimeIn.getHours() === $scope.sunTimeOut.getHours()){
						if($scope.sunTimeIn.getMinutes() < $scope.sunTimeOut.getMinutes()){
							timesValid = true;
						}
					}
				}
				if($scope.sunTimeIn.getHours() === $scope.sunTimeOut.getHours()){
					if($scope.sunTimeIn.getMinutes() === $scope.sunTimeOut.getMinutes()){
						timesValid = false;
					}
				}
				if($scope.sunTimeIn.getFullYear() > today.getFullYear()){
					isFuture = true;
				} else if($scope.sunTimeIn.getFullYear() === today.getFullYear()){
					if($scope.sunTimeIn.getMonth() > today.getMonth()){
						isFuture = true;
					} else if($scope.sunTimeIn.getMonth() === today.getMonth()){
						if($scope.sunTimeIn.getDate() > today.getDate()){
							isFuture = true;
						}
					}
				}
				if(timesValid && !isFuture){
					var punchesIn = $scope.child.punchesIn;
					var punchesOut = $scope.child.punchesOut;
					var dateFoundIn = false;
					var dateFoundOut = false;
					for(var i=0; i<punchesIn.length; i++){
						var d = new Date(punchesIn[i].punch);
						if(d.getDate() === $scope.sunTimeIn.getDate()){
							if(d.getMonth() === $scope.sunTimeIn.getMonth()){
								if(d.getFullYear() === $scope.sunTimeIn.getFullYear()){
									dateFoundIn = true;
									punchesIn[i].punch = $scope.sunTimeIn.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundIn){
						punchesIn.push($scope.sunTimeIn);
					}
					for(i=0; i<punchesOut.length; i++){
						var d2 = new Date(punchesOut[i].punch);
						if(d2.getDate() === $scope.sunTimeOut.getDate()){
							if(d2.getMonth() === $scope.sunTimeOut.getMonth()){
								if(d2.getFullYear() === $scope.sunTimeOut.getFullYear()){
									dateFoundOut = true;
									punchesOut[i].punch = $scope.sunTimeOut.toISOString();
									console.log('test');
								}
							}
						}
					}
					if(!dateFoundOut){
						punchesOut.push($scope.sunTimeOut);
					}
					if(dateFoundIn){
						if(!dateFoundOut){
							$scope.child.isPunchedIn = false;
						}
					}
					$scope.success7 = $scope.error7 = null;
					$scope.child.$update(function(response) {
						$scope.success7 = 'Date Updated';
						$scope.child = response;
						}, function(response) {
							$scope.error7 = response.data.message;
					});
					$scope.sunEdit = false;
					$scope.$watch('success7',function(newValue, oldValue){
						if(newValue === 'Date Updated'){
							timeBuilder();
						}
					});
				} else{
					if(!timesValid){
						$scope.error7 = 'Time In must be before Time Out';
					} else if(isFuture){
						$scope.error7 = 'Cannot edit dates in the future';
					}
				}
			}
		};

		$scope.monBillingMode = function(){
			console.log('bing');
			if($scope.monDayCampMode === null){
				return false;
			} else{
				return $scope.monDayCampMode;
			}
		};
	}
]);