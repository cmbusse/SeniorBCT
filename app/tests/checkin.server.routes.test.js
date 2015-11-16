'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Checkin = mongoose.model('Checkin'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, checkin;

/**
 * Checkin routes tests
 */
describe('Checkin CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Checkin
		user.save(function() {
			checkin = {
				name: 'Checkin Name'
			};

			done();
		});
	});

	it('should be able to save Checkin instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Checkin
				agent.post('/checkins')
					.send(checkin)
					.expect(200)
					.end(function(checkinSaveErr, checkinSaveRes) {
						// Handle Checkin save error
						if (checkinSaveErr) done(checkinSaveErr);

						// Get a list of Checkins
						agent.get('/checkins')
							.end(function(checkinsGetErr, checkinsGetRes) {
								// Handle Checkin save error
								if (checkinsGetErr) done(checkinsGetErr);

								// Get Checkins list
								var checkins = checkinsGetRes.body;

								// Set assertions
								(checkins[0].user._id).should.equal(userId);
								(checkins[0].name).should.match('Checkin Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Checkin instance if not logged in', function(done) {
		agent.post('/checkins')
			.send(checkin)
			.expect(401)
			.end(function(checkinSaveErr, checkinSaveRes) {
				// Call the assertion callback
				done(checkinSaveErr);
			});
	});

	it('should not be able to save Checkin instance if no name is provided', function(done) {
		// Invalidate name field
		checkin.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Checkin
				agent.post('/checkins')
					.send(checkin)
					.expect(400)
					.end(function(checkinSaveErr, checkinSaveRes) {
						// Set message assertion
						(checkinSaveRes.body.message).should.match('Please fill Checkin name');
						
						// Handle Checkin save error
						done(checkinSaveErr);
					});
			});
	});

	it('should be able to update Checkin instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Checkin
				agent.post('/checkins')
					.send(checkin)
					.expect(200)
					.end(function(checkinSaveErr, checkinSaveRes) {
						// Handle Checkin save error
						if (checkinSaveErr) done(checkinSaveErr);

						// Update Checkin name
						checkin.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Checkin
						agent.put('/checkins/' + checkinSaveRes.body._id)
							.send(checkin)
							.expect(200)
							.end(function(checkinUpdateErr, checkinUpdateRes) {
								// Handle Checkin update error
								if (checkinUpdateErr) done(checkinUpdateErr);

								// Set assertions
								(checkinUpdateRes.body._id).should.equal(checkinSaveRes.body._id);
								(checkinUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Checkins if not signed in', function(done) {
		// Create new Checkin model instance
		var checkinObj = new Checkin(checkin);

		// Save the Checkin
		checkinObj.save(function() {
			// Request Checkins
			request(app).get('/checkins')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Checkin if not signed in', function(done) {
		// Create new Checkin model instance
		var checkinObj = new Checkin(checkin);

		// Save the Checkin
		checkinObj.save(function() {
			request(app).get('/checkins/' + checkinObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', checkin.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Checkin instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Checkin
				agent.post('/checkins')
					.send(checkin)
					.expect(200)
					.end(function(checkinSaveErr, checkinSaveRes) {
						// Handle Checkin save error
						if (checkinSaveErr) done(checkinSaveErr);

						// Delete existing Checkin
						agent.delete('/checkins/' + checkinSaveRes.body._id)
							.send(checkin)
							.expect(200)
							.end(function(checkinDeleteErr, checkinDeleteRes) {
								// Handle Checkin error error
								if (checkinDeleteErr) done(checkinDeleteErr);

								// Set assertions
								(checkinDeleteRes.body._id).should.equal(checkinSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Checkin instance if not signed in', function(done) {
		// Set Checkin user 
		checkin.user = user;

		// Create new Checkin model instance
		var checkinObj = new Checkin(checkin);

		// Save the Checkin
		checkinObj.save(function() {
			// Try deleting Checkin
			request(app).delete('/checkins/' + checkinObj._id)
			.expect(401)
			.end(function(checkinDeleteErr, checkinDeleteRes) {
				// Set message assertion
				(checkinDeleteRes.body.message).should.match('User is not logged in');

				// Handle Checkin error error
				done(checkinDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Checkin.remove().exec();
		done();
	});
});