'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'ui.bootstrap'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('children');
'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('children').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Children', 'children', 'dropdown', '/children(/create)?');
		Menus.addSubMenuItem('topbar', 'children', 'List Children', 'children');
		Menus.addSubMenuItem('topbar', 'children', 'New Child', 'children/create');
	}
]);
'use strict';

//Setting up route
angular.module('children').config(['$stateProvider',
	function($stateProvider) {
		// Children state routing
		$stateProvider.
		state('addmore', {
			url: '/children/addmore',
			templateUrl: 'modules/children/views/addmore.client.view.html'
		}).
		state('listChildren', {
			url: '/children',
			templateUrl: 'modules/children/views/list-children.client.view.html'
		}).
		state('createChild', {
			url: '/children/create',
			templateUrl: 'modules/children/views/create-child.client.view.html'
		}).
		state('viewChild', {
			url: '/children/:childId',
			templateUrl: 'modules/children/views/view-child.client.view.html'
		}).
		state('editChild', {
			url: '/children/:childId/edit',
			templateUrl: 'modules/children/views/edit-child.client.view.html'
		});
	}
]);
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
			if($scope.children.length){
				$scope.dayCampMode = $scope.children[0].dayCampMode;
			} else{
				$scope.dayCampMode = false;
			}
			// Create new Child object
			var child = new Children ({
				firstName: this.firstName,
				lastName: this.lastName,
				dob: this.dob,
				timePunches: this.timePunches,
				parentLastName: $scope.currentuser.lastName,
				parentFirstName: $scope.currentuser.firstName,
				dayCampMode: $scope.dayCampMode
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
	       			var parentID = -1;
	       			if(currChild.user !== null){
		       			parentID = currChild.user._id;	
		       		}
		       		if(parentID === userid){
		       			usersChildren.push(currChild);
		       		}
	       		}
			if(usersChildren.length){
		       		$scope.newestChild = usersChildren[0];
			}
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

		$scope.inCity = function() {
			return $scope.child.inCity;
		};

		// Make Child In City
		$scope.makeInCity = function(){
			$scope.child.inCity = 'true';
			$scope.child.$update(function(response) {

				}, function(response) {
					$scope.error = response.data.message;
			});
		};

		// Make Child Out of City
		$scope.makeOutofCity = function(){
			$scope.child.inCity = 'false';
			$scope.child.$update(function(response) {

				}, function(response) {
					$scope.error = response.data.message;
			});
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
			// TODO
			// THe problem is that the $scope.monIn is being set to the punchesIn[i] below. Need to find a way
			// to determine if this has been set properly, needs to either be set to the value from
			// punchesIn OR be set from the selector in editMondayForm
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
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === tueDate.getDate()){
					if(d.getMonth() === tueDate.getMonth()){
						if(d.getFullYear() === tueDate.getFullYear()){
							$scope.tueInDisplay = d;
							$scope.tueIn = $scope.child.punchesIn[i];
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
							$scope.tueOutDisplay = d;
							$scope.tueOut = $scope.child.punchesOut[i];
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
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === wedDate.getDate()){
					if(d.getMonth() === wedDate.getMonth()){
						if(d.getFullYear() === wedDate.getFullYear()){
							$scope.wedIn = $scope.child.punchesIn[i];
							$scope.wedInDisplay = d;
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
							$scope.wedOut = $scope.child.punchesOut[i];
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
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === thuDate.getDate()){
					if(d.getMonth() === thuDate.getMonth()){
						if(d.getFullYear() === thuDate.getFullYear()){
							$scope.thuIn = $scope.child.punchesIn[i];
							$scope.thuInDisplay = d;
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
							$scope.thuOut = $scope.child.punchesOut[i];
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
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === friDate.getDate()){
					if(d.getMonth() === friDate.getMonth()){
						if(d.getFullYear() === friDate.getFullYear()){
							$scope.friIn = $scope.child.punchesIn[i];
							$scope.friInDisplay = d;
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
							$scope.friOut = $scope.child.punchesOut[i];
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
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === satDate.getDate()){
					if(d.getMonth() === satDate.getMonth()){
						if(d.getFullYear() === satDate.getFullYear()){
							$scope.satIn = $scope.child.punchesIn[i];
							$scope.satInDisplay = d;
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
							$scope.satOut = $scope.child.punchesOut[i];
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
				d = new Date($scope.child.punchesIn[i].punch);
				if(d.getDate() === sunDate.getDate()){
					if(d.getMonth() === sunDate.getMonth()){
						if(d.getFullYear() === sunDate.getFullYear()){
							$scope.sunIn = $scope.child.punchesIn[i];
							$scope.sunInDisplay = d;
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
							$scope.sunOut = $scope.child.punchesOut[i];
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
				// If child attended every day in the week use weekly pricing model
				if(dayCount === 5){
					// If the child applies for the in city rate
					if($scope.child.inCity){
						$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + 45;
					}
					// If the child doesn't apply for the in city rate
					if(!$scope.child.inCity){
						$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + 50;
					}
				}
				// If child attended less than 5 days use daily pricing model
				else{
					if($scope.child.inCity){
						$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + dayCount * 11;
					}
					// If the child doesn't apply for the in city rate
					if(!$scope.child.inCity){
						$scope.totalBill = $scope.monBill + $scope.tueBill + $scope.wedBill + $scope.thuBill + $scope.friBill + $scope.satBill + $scope.sunBill + dayCount * 13;
					}
				}
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
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null;
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
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
			$scope.success1 = $scope.success2 = $scope.success3 = $scope.success4 = $scope.success5 = $scope.success6 = $scope.success7 = null;
			$scope.error1 = $scope.error2 = $scope.error3 = $scope.error4 = $scope.error5 = $scope.error6 = $scope.error7 = null;
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
					//update monIn here???
					if($scope.monIn === 'N/A'){
						$scope.monIn = {};
						$scope.monIn.dayCampMode = $scope.editMondayForm.monDayCampMode.$modelValue;						
					}
					
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
									punchesIn[i].dayCampMode = $scope.monDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.monDayCampMode;
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
				$scope.tueDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.tueIn.punch);
				$scope.tueTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.tueDayCampMode = $scope.tueIn.dayCampMode;
			}
			if($scope.tueOut === 'N/A'){
				var d2 = new Date();
				$scope.tueTimeOut = new Date($scope.tueDate.getFullYear(), $scope.tueDate.getMonth(), $scope.tueDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.tueOut.punch);
				$scope.tueTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
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
									punchesIn[i].dayCampMode = $scope.tueDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.tueDayCampMode;
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
				$scope.wedDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.wedIn.punch);
				$scope.wedTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.wedDayCampMode = $scope.wedIn.dayCampMode;
			}
			if($scope.wedOut === 'N/A'){
				var d2 = new Date();
				$scope.wedTimeOut = new Date($scope.wedDate.getFullYear(), $scope.wedDate.getMonth(), $scope.wedDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.wedOut.punch);
				$scope.wedTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
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
									punchesIn[i].dayCampMode = $scope.wedDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.wedDayCampMode;
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
				$scope.thuDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.thuIn.punch);
				$scope.thuTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.thuDayCampMode = $scope.thuIn.dayCampMode;
			}
			if($scope.thuOut === 'N/A'){
				var d2 = new Date();
				$scope.thuTimeOut = new Date($scope.thuDate.getFullYear(), $scope.thuDate.getMonth(), $scope.thuDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.thuOut.punch);
				$scope.thuTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
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
									punchesIn[i].dayCampMode = $scope.thuDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.thuDayCampMode;
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
				$scope.friDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.friIn.punch);
				$scope.friTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.friDayCampMode = $scope.friIn.dayCampMode;
			}
			if($scope.friOut === 'N/A'){
				var d2 = new Date();
				$scope.friTimeOut = new Date($scope.friDate.getFullYear(), $scope.friDate.getMonth(), $scope.friDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.friOut.punch);
				$scope.friTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
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
									punchesIn[i].dayCampMode = $scope.friDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.friDayCampMode;
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
				$scope.satDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.satIn.punch);
				$scope.satTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.satDayCampMode = $scope.satIn.dayCampMode;
			}
			if($scope.satOut === 'N/A'){
				var d2 = new Date();
				$scope.satTimeOut = new Date($scope.satDate.getFullYear(), $scope.satDate.getMonth(), $scope.satDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.satOut.punch);
				$scope.satTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
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
									punchesIn[i].dayCampMode = $scope.satDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.satDayCampMode;
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
				$scope.sunDayCampMode = $scope.child.dayCampMode;
			} else{
				var d3 = new Date($scope.sunIn.punch);
				$scope.sunTimeIn = new Date(d3.getFullYear(), d3.getMonth(), d3.getDate(), d3.getHours(), d3.getMinutes());
				$scope.sunDayCampMode = $scope.sunIn.dayCampMode;
			}
			if($scope.sunOut === 'N/A'){
				var d2 = new Date();
				$scope.sunTimeOut = new Date($scope.sunDate.getFullYear(), $scope.sunDate.getMonth(), $scope.sunDate.getDate(), d2.getHours(), d2.getMinutes());
			} else{
				var d4 = new Date($scope.sunOut.punch);
				$scope.sunTimeOut = new Date(d4.getFullYear(), d4.getMonth(), d4.getDate(), d4.getHours(), d4.getMinutes());
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
									punchesIn[i].dayCampMode = $scope.sunDayCampMode;
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
									punchesOut[i].dayCampMode = $scope.sunDayCampMode;
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

'use strict';

angular.module('children').filter('millSecondsToTimeString', [
	function() {
		return function(millseconds) {
		    var seconds = Math.floor(millseconds / 1000);
		    var days = Math.floor(seconds / 86400);
		    var hours = Math.floor((seconds % 86400) / 3600);
		    var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
		    var timeString = '';
		    if(days > 0) timeString += (days > 1) ? (days + ' days ') : (days + ' day ');
		    if(hours > 0) timeString += (hours > 1) ? (hours + ' hours ') : (hours + ' hour ');
		    if(minutes >= 0) timeString += (minutes > 1) ? (minutes + ' minutes ') : (minutes + ' minute ');
		    return timeString;
		};
	}
]);
'use strict';

//Children service used to communicate Children REST endpoints
angular.module('children').factory('Children', ['$resource',
	function($resource) {
		return $resource('children/:childId', { childId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';


angular.module('core').controller('FooterController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
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
		$scope.billHref = '/#!/';

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
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('bill', {
			url: '/users/:userId/bill',
			templateUrl: 'modules/users/views/bill.client.view.html'
		}).
		state('success', {
			url: '/success',
			templateUrl: 'modules/users/views/authentication/success.client.view.html'
		}).
		state('edit-user', {
			url: '/users/:userId/edit',
			templateUrl: 'modules/users/views/admin/edit-user.client.view.html'
		}).
		state('childview', {
			url: '/checkin/:userId',
			templateUrl: 'modules/users/views/checkin/childview.client.view.html'
		}).
		state('checkinstatus', {
			url: '/checkin/:userId/status',
			templateUrl: 'modules/users/views/checkin/status.client.view.html'
		}).
		state('view-user', {
			url: '/users/:userId',
			templateUrl: 'modules/users/views/admin/view-user.client.view.html'
		}).
		state('user-view-children', {
			url: '/mychildren',
			templateUrl: 'modules/users/views/user-view-children.client.view.html'
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('list', {
			url: '/dashboard',
			templateUrl: 'modules/users/views/admin/dashboard.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('checkin', {
			url: '/checkin',
			templateUrl: 'modules/users/views/checkin/customersignin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$rootScope', '$http', '$location', 'Authentication', 'Users', '$window',
	function($scope, $rootScope, $http, $location, Authentication, Users, $window) {
		$scope.authentication = Authentication;
		$scope.users = {};

		//retrieve a list of users in the website
		$scope.findAllUsers = function(){
			$scope.users = Users.query();
		};	

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {			
			// PIN Setting
	        var testPIN = 0;
	        var PINFound = false;

	        var i = 0;
	        do{
	          // Format the PIN so it is 4 digits
	          testPIN = ('000' + i).slice(-4);
	            // Check the PIN against every user in users for matches
	            for(var j = 0; j < $scope.users.length; j++){
	              // If the PIN matches a user, move on to the next try
	              if($scope.users[j].PIN === testPIN){
	                break;
	              }
	              // If we have checked it against every user and there were no matches
	              // we have found a good PIN
	              if(j === ($scope.users.length-1)){
	                PINFound = true;
	              }
	            }
	            i++;
	        }
	        while (i < 9999 && PINFound !== true);
			
			$scope.credentials.PIN = testPIN;
			console.log('test in signup');
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the children/create page
				//$location.path('/children/create');
				$location.path('/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				// And redirect to the index page
				$location.path('/');
				// HERE IS THE "SOLUTION"
        $rootScope.$on('$stateChangeSuccess', function(){
            $window.location.reload();
        });

			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
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
'use strict';

angular.module('users').controller('ClockController', ['$scope','$timeout',
	function TimeCtrl($scope, $timeout) {
    $scope.clock = 'loading clock...'; // initialise the time variable
    $scope.tickInterval = 1000; //ms

    var tick = function() {
        $scope.clock = Date.now(); // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    };

    // Start the timer
    $timeout(tick, $scope.tickInterval);
}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		/*
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};
		*/

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.updateGeneralInfo = function(isValid){
			if (isValid) {
				$scope.success1 = $scope.error1 = null;
				var user = new Users($scope.user);
				user.$update(function(response) {
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
				var user = new Users($scope.user);
				user.$update(function(response) {
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
				var user = new Users($scope.user);
				user.$update(function(response) {
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
				var user = new Users($scope.user);
				user.$update(function(response) {
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
	}
]);
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
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', function($window) {
	var auth = {
		user: $window.user
	};
	
	return auth;
}]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			},
			updateUser: {
				method: 'PUT',
				url: 'users/:id',
				params: {id: '@_id'}
			}
		});
	}
]);