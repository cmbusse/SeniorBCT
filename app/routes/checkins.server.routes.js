'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var checkins = require('../../app/controllers/checkins.server.controller');

	// Checkins Routes
	app.route('/checkins')
		.get(checkins.list)
		.post(users.requiresLogin, checkins.create);

	app.route('/checkins/:checkinId')
		.get(checkins.read)
		.put(users.requiresLogin, checkins.hasAuthorization, checkins.update)
		.delete(users.requiresLogin, checkins.hasAuthorization, checkins.delete);

	// Finish by binding the Checkin middleware
	app.param('checkinId', checkins.checkinByID);
};
