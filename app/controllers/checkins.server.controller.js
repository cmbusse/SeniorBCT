'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Checkin = mongoose.model('Checkin'),
	_ = require('lodash');

/**
 * Create a Checkin
 */
exports.create = function(req, res) {
	var checkin = new Checkin(req.body);
	checkin.user = req.user;

	checkin.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(checkin);
		}
	});
};

/**
 * Show the current Checkin
 */
exports.read = function(req, res) {
	res.jsonp(req.checkin);
};

/**
 * Update a Checkin
 */
exports.update = function(req, res) {
	var checkin = req.checkin ;

	checkin = _.extend(checkin , req.body);

	checkin.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(checkin);
		}
	});
};

/**
 * Delete an Checkin
 */
exports.delete = function(req, res) {
	var checkin = req.checkin ;

	checkin.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(checkin);
		}
	});
};

/**
 * List of Checkins
 */
exports.list = function(req, res) { 
	Checkin.find().sort('-created').populate('user', 'displayName').exec(function(err, checkins) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(checkins);
		}
	});
};

/**
 * Checkin middleware
 */
exports.checkinByID = function(req, res, next, id) { 
	Checkin.findById(id).populate('user', 'displayName').exec(function(err, checkin) {
		if (err) return next(err);
		if (! checkin) return next(new Error('Failed to load Checkin ' + id));
		req.checkin = checkin ;
		next();
	});
};

/**
 * Checkin authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.checkin.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
