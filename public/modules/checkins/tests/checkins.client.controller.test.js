'use strict';

(function() {
	// Checkins Controller Spec
	describe('Checkins Controller Tests', function() {
		// Initialize global variables
		var CheckinsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Checkins controller.
			CheckinsController = $controller('CheckinsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Checkin object fetched from XHR', inject(function(Checkins) {
			// Create sample Checkin using the Checkins service
			var sampleCheckin = new Checkins({
				name: 'New Checkin'
			});

			// Create a sample Checkins array that includes the new Checkin
			var sampleCheckins = [sampleCheckin];

			// Set GET response
			$httpBackend.expectGET('checkins').respond(sampleCheckins);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.checkins).toEqualData(sampleCheckins);
		}));

		it('$scope.findOne() should create an array with one Checkin object fetched from XHR using a checkinId URL parameter', inject(function(Checkins) {
			// Define a sample Checkin object
			var sampleCheckin = new Checkins({
				name: 'New Checkin'
			});

			// Set the URL parameter
			$stateParams.checkinId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/checkins\/([0-9a-fA-F]{24})$/).respond(sampleCheckin);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.checkin).toEqualData(sampleCheckin);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Checkins) {
			// Create a sample Checkin object
			var sampleCheckinPostData = new Checkins({
				name: 'New Checkin'
			});

			// Create a sample Checkin response
			var sampleCheckinResponse = new Checkins({
				_id: '525cf20451979dea2c000001',
				name: 'New Checkin'
			});

			// Fixture mock form input values
			scope.name = 'New Checkin';

			// Set POST response
			$httpBackend.expectPOST('checkins', sampleCheckinPostData).respond(sampleCheckinResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Checkin was created
			expect($location.path()).toBe('/checkins/' + sampleCheckinResponse._id);
		}));

		it('$scope.update() should update a valid Checkin', inject(function(Checkins) {
			// Define a sample Checkin put data
			var sampleCheckinPutData = new Checkins({
				_id: '525cf20451979dea2c000001',
				name: 'New Checkin'
			});

			// Mock Checkin in scope
			scope.checkin = sampleCheckinPutData;

			// Set PUT response
			$httpBackend.expectPUT(/checkins\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/checkins/' + sampleCheckinPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid checkinId and remove the Checkin from the scope', inject(function(Checkins) {
			// Create new Checkin object
			var sampleCheckin = new Checkins({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Checkins array and include the Checkin
			scope.checkins = [sampleCheckin];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/checkins\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCheckin);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.checkins.length).toBe(0);
		}));
	});
}());