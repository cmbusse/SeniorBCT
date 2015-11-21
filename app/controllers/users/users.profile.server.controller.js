'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.jsonp(req.user || null);
};

/**
* List Users
*/
exports.list = function(req, res) {
	console.log('listing users');
	User.find().sort('lastName').exec(function(err, users) {
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//console.log(users.length);
			res.jsonp(users);
		}
	});
};

/**
 * Show the current User
 */
exports.read = function(req, res) {
	res.jsonp(req.user);
};

/**
 * Update specific User Roles
*/
exports.updateUser = function(req, res) { 
	var currUser = req.body;
	User.findById(currUser._id, function(err, user) {
		var query = {'_id': currUser._id };
		var update = { 	roles: currUser.roles, 
						active: currUser.active,
						PIN: currUser.PIN,
						displayName: currUser.displayName,
						email: currUser.email,
						firstName: currUser.firstName,
						lastName: currUser.lastName,
						phone: currUser.phone,
						username: currUser.username,
						childNames: currUser.childNames,
						childIds: currUser.childIds };
		var options = { new: true };
		User.findOneAndUpdate(query, update, options, function(err, person) {
			if (err) {
				console.log('got an error');
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(currUser);
			}
		});
	});
};


/**
 * Delete a user
 
exports.delete = function(req, res) {
	var user = req.user ;
	user.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user);
		}
	});
};
*/