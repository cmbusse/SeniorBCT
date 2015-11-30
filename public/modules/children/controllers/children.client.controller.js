'use strict';

// Children controller
angular.module('children').controller('ChildrenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Children', 'Users',
	function($scope, $stateParams, $location, Authentication, Children, Users) {
		$scope.authentication = Authentication;
		$scope.currentuser = Authentication.user;
		$scope.usersChildren = {};
		$scope.newestChild = {};
		$scope.weekOfDate = {};
		$scope.monDate = {};
		$scope.tueDate = {};
		$scope.wedDate = {};
		$scope.thuDate = {};
		$scope.friDate = {};
		$scope.satDate = {};
		$scope.sunDate = {};

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
			var d2 = new Date();
			var d3 = new Date();
			var d4 = new Date();
			var d5 = new Date();
			var d6 = new Date();
			var d7 = new Date();
			var day = d.getDay();
			var diff = d.getDate() - day + (day === 0 ? -6:1);
			$scope.weekOfDate = new Date(d.setDate(diff));
			$scope.monDate = new Date(d.setDate(diff));
			$scope.tueDate = new Date(d2.setDate(diff+1));
			$scope.wedDate = new Date(d3.setDate(diff+2));
			$scope.thuDate = new Date(d4.setDate(diff+3));
			$scope.friDate = new Date(d5.setDate(diff+4));
			$scope.satDate = new Date(d6.setDate(diff+5));
			$scope.sunDate = new Date(d7.setDate(diff+6));
			console.log('test');
		};

		$scope.backOneWeek = function(){
			// revisit, focus on how things are updating, maybe trying new dating them before setting, idk though.  Or try making new date with weekOfDate as value, might work
			var d = new Date($scope.weekOfDate);
			var d2 = new Date($scope.weekOfDate);
			var d3 = new Date($scope.weekOfDate);
			var d4 = new Date($scope.weekOfDate);
			var d5 = new Date($scope.weekOfDate);
			var d6 = new Date($scope.weekOfDate);
			var d7 = new Date($scope.weekOfDate);
			var diff = d.getDate();
			diff = diff-7;
			if(diff<=0){
				$scope.weekOfDate = new Date(d.setDate(diff));
				$scope.monDate = $scope.weekOfDate;
				var day = d.getDay();
				diff = d.getDate() - day + (day === 0 ? -6:1);
				$scope.tueDate = new Date(d2.setDate(diff+1));
				$scope.wedDate = new Date(d3.setDate(diff+2));
				$scope.thuDate = new Date(d4.setDate(diff+3));
				$scope.friDate = new Date(d5.setDate(diff+4));
				$scope.satDate = new Date(d6.setDate(diff+5));
				$scope.sunDate = new Date(d7.setDate(diff+6));
			} else{
				$scope.weekOfDate = new Date(d.setDate(diff));
				$scope.monDate = $scope.weekOfDate;
				$scope.tueDate = new Date(d2.setDate(diff+1));
				$scope.wedDate = new Date(d3.setDate(diff+2));
				$scope.thuDate = new Date(d4.setDate(diff+3));
				$scope.friDate = new Date(d5.setDate(diff+4));
				$scope.satDate = new Date(d6.setDate(diff+5));
				$scope.sunDate = new Date(d7.setDate(diff+6));
			}
			console.log('test');

		};

		// NOTE:  setDate documentation:  http://www.w3schools.com/jsref/jsref_setdate.asp
		// setDate can basically keep going in -7 intervals to keep moving back dates
		// Copied from UI bootstrap example
		/*
		$scope.today = function() {
			$scope.dt = new Date();
		};
		$scope.today();

		$scope.clear = function () {
			$scope.dt = null;
		};

		// Disable weekend selection
		$scope.disabled = function(date, mode) {
			return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 
				|| date.getDay() === 5 || date.getDay() === 4 || date.getDay() === 3 
				|| date.getDay() === 2) );
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
		*/

	}

]);