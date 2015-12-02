'use strict';

// TODO:  Make it so if a child has been checked in already that day, they can't be checked in again, should be one of the last we do so we can keep testing

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
				parentFirstName: $scope.currentuser.firstName

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
				} else if($scope.currentuser._id === $scope.child.user._id){
					return true;
				} else{
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
			$scope.monTimeIn = $scope.monTimeOut = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
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
			//TODO:  Update monTimeIn and others here when times are built
			var punchesIn = [];
			var punchesOut = [];
			for(var i=0; i<$scope.child.punchesIn.length; i++){
				var d = new Date($scope.child.punchesIn[i].punch);
				punchesIn.push(d);
			}
			for(i=0; i<$scope.child.punchesOut.length; i++){
				var d2 = new Date($scope.child.punchesOut[i].punch);
				punchesOut.push(d2);
			}
			// build Monday Times
			var monDate = $scope.monDate;
			var monInFound = false;
			var monOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				if(punchesIn[i].getDate() === monDate.getDate()){
					if(punchesIn[i].getMonth() === monDate.getMonth()){
						if(punchesIn[i].getFullYear() === monDate.getFullYear()){
							$scope.monIn = punchesIn[i];
							monInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === monDate.getDate()){
					if(punchesOut[i].getMonth() === monDate.getMonth()){
						if(punchesOut[i].getFullYear() === monDate.getFullYear()){
							$scope.monOut = punchesOut[i];
							monOutFound = true;
						}
					}
				}
			}
			if(!monInFound){
				$scope.monIn = 'N/A';
			}
			if(!monOutFound){
				$scope.monOut = 'N/A';
			}
			if($scope.monIn === 'N/A' || $scope.monOut === 'N/A'){
				$scope.monTotal = 'N/A';
			} else{
				$scope.monTotal = $scope.monOut - $scope.monIn;
			}
			// build tuesday Times
			var tueDate = $scope.tueDate;
			var tueInFound = false;
			var tueOutFound = false;
			for(i=0; i<punchesIn.length; i++){
				if(punchesIn[i].getDate() === tueDate.getDate()){
					if(punchesIn[i].getMonth() === tueDate.getMonth()){
						if(punchesIn[i].getFullYear() === tueDate.getFullYear()){
							$scope.tueIn = punchesIn[i];
							tueInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === tueDate.getDate()){
					if(punchesOut[i].getMonth() === tueDate.getMonth()){
						if(punchesOut[i].getFullYear() === tueDate.getFullYear()){
							$scope.tueOut = punchesOut[i];
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
				if(punchesIn[i].getDate() === wedDate.getDate()){
					if(punchesIn[i].getMonth() === wedDate.getMonth()){
						if(punchesIn[i].getFullYear() === wedDate.getFullYear()){
							$scope.wedIn = punchesIn[i];
							wedInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === wedDate.getDate()){
					if(punchesOut[i].getMonth() === wedDate.getMonth()){
						if(punchesOut[i].getFullYear() === wedDate.getFullYear()){
							$scope.wedOut = punchesOut[i];
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
				if(punchesIn[i].getDate() === thuDate.getDate()){
					if(punchesIn[i].getMonth() === thuDate.getMonth()){
						if(punchesIn[i].getFullYear() === thuDate.getFullYear()){
							$scope.thuIn = punchesIn[i];
							thuInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === thuDate.getDate()){
					if(punchesOut[i].getMonth() === thuDate.getMonth()){
						if(punchesOut[i].getFullYear() === thuDate.getFullYear()){
							$scope.thuOut = punchesOut[i];
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
				if(punchesIn[i].getDate() === friDate.getDate()){
					if(punchesIn[i].getMonth() === friDate.getMonth()){
						if(punchesIn[i].getFullYear() === friDate.getFullYear()){
							$scope.friIn = punchesIn[i];
							friInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === friDate.getDate()){
					if(punchesOut[i].getMonth() === friDate.getMonth()){
						if(punchesOut[i].getFullYear() === friDate.getFullYear()){
							$scope.friOut = punchesOut[i];
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
				if(punchesIn[i].getDate() === satDate.getDate()){
					if(punchesIn[i].getMonth() === satDate.getMonth()){
						if(punchesIn[i].getFullYear() === satDate.getFullYear()){
							$scope.satIn = punchesIn[i];
							satInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === satDate.getDate()){
					if(punchesOut[i].getMonth() === satDate.getMonth()){
						if(punchesOut[i].getFullYear() === satDate.getFullYear()){
							$scope.satOut = punchesOut[i];
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
				if(punchesIn[i].getDate() === sunDate.getDate()){
					if(punchesIn[i].getMonth() === sunDate.getMonth()){
						if(punchesIn[i].getFullYear() === sunDate.getFullYear()){
							$scope.sunIn = punchesIn[i];
							sunInFound = true;
						}
					}
				}
			}
			for(i=0; i<punchesOut.length; i++){
				if(punchesOut[i].getDate() === sunDate.getDate()){
					if(punchesOut[i].getMonth() === sunDate.getMonth()){
						if(punchesOut[i].getFullYear() === sunDate.getFullYear()){
							$scope.sunOut = punchesOut[i];
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

		/*
		// Use ng-click to call this on a week change
		$scope.rebuildTimes = function(){
	
		};
		*/

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

		$scope.editMonday = function(){
			$scope.monEdit = true;
			if($scope.monIn === 'N/A'){
				var d = new Date();
				$scope.monTimeIn = new Date($scope.monDate.getFullYear(), $scope.monDate.getMonth(), $scope.monDate.getDate(), d.getHours(), d.getMinutes());
			} else{
				$scope.monTimeIn = new Date($scope.monIn.getFullYear(), $scope.monIn.getMonth(), $scope.monIn.getDate(), $scope.monIn.getHours(), $scope.monIn.getMinutes());
			}
			if($scope.monOut === 'N/A'){
				var d2 = new Date();
				$scope.monTimeOut = new Date($scope.monDate.getFullYear(), $scope.monDate.getMonth(), $scope.monDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				$scope.monTimeOut = new Date($scope.monOut.getFullYear(), $scope.monOut.getMonth(), $scope.monOut.getDate(), $scope.monOut.getHours(), $scope.monOut.getMinutes());
			}
		};

		$scope.cancelEditMonday = function(){
			$scope.monEdit = false;
		};

		$scope.editMondayTimes = function(isValid){
			if(isValid){
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
					$scope.success1 = true;
					$scope.child = response;
					}, function(response) {
						$scope.error1 = response.data.message;
				});
				$scope.monEdit = false;
				timeBuilder();
				// TODO:  Morning, check why timeBuilder isn't updating non this week views, add in success message on html, extend to other days
			}
		};

		/*

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

		*/
		
		// Copied from UI bootstrap example
		
		$scope.today = function() {
			$scope.dt = new Date();
		};
		$scope.today();

		$scope.clear = function () {
			$scope.dt = null;
		};

		$scope.open = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.opened = true;
		};

		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1,
			showWeeks: false
		};

		$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		

	}

]);