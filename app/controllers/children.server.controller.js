'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Child = mongoose.model('Child'),
	Punch = mongoose.model('Punch'),
	_ = require('lodash');

/**
 * Create a Child
 */
exports.create = function(req, res) {
	var child = new Child(req.body);
	child.user = req.user;

	child.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(child);
		}
	});
};

/**
 * Show the current Child
 */
exports.read = function(req, res) {
	res.jsonp(req.child);
};

/**
 * Update a Child
 */
exports.update = function(req, res) {
	var currChild = req.body;
	var punchListIn = currChild.punchesIn;
	var punchListOut = currChild.punchesOut;

	var newPunchesIn = [];
	var newPunchesOut = [];
	for (var i=0; i<punchListIn.length; i++){
		var d;
		var dayCampMode;
		if(typeof punchListIn[i] === 'string'){
			d = new Date(punchListIn[i]);
			dayCampMode = currChild.dayCampMode;
		} else{
			d = punchListIn[i].punch;
			dayCampMode = punchListIn[i].dayCampMode;
		}
		var punch = new Punch({
			punch: d,
			dayCampMode: dayCampMode
		});
		newPunchesIn.push(punch);
	}

	for (var j=0; j<punchListOut.length; j++){
		var d2;
		var dayCampMode2;
		if(typeof punchListOut[j] === 'string'){
			d2 = new Date(punchListOut[j]);	
			dayCampMode2 = currChild.dayCampMode;
		} else{
			d2 = punchListOut[j].punch;
			dayCampMode2 = punchListOut[j].dayCampMode;
		}
		var punch2 = new Punch({
			punch: d2,
			dayCampMode: dayCampMode2
		});
		newPunchesOut.push(punch2);
	}
	
	if(typeof currChild.lastCheckIn === 'undefined'){
		currChild.lastCheckIn = new Date(0);
	}
	
	Child.findById(currChild._id, function(err, child) {
		var query = {'_id': currChild._id };
		var update = { 	$set: {
							firstName: currChild.firstName, 
							lastName: currChild.lastName,
							dob: currChild.dob,
							punchesIn: newPunchesIn,
							punchesOut: newPunchesOut,
							isPunchedIn: currChild.isPunchedIn,
							lastCheckIn: currChild.lastCheckIn,
							parentFirstName: currChild.parentFirstName,
							parentLastName: currChild.parentLastName,
							justCheckedIn: currChild.justCheckedIn,
							justCheckedOut: currChild.justCheckedOut,
							dayCampMode: currChild.dayCampMode,
							inCity: currChild.inCity
						},
					 };
		var options = { new: true };
		Child.findOneAndUpdate(query, update, options, function(err, child) {
			if (err) {
				console.log('got an error');
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else{
				res.json(child);
			}
		});
	});
};

/**
 * Delete an Child
 */
exports.delete = function(req, res) {
	var child = req.child ;

	child.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(child);
		}
	});
};

/**
 * List of Children
 */
exports.list = function(req, res) { 
	Child.find().sort('-created').populate('user', 'displayName').exec(function(err, children) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(children);
		}
	});
};

/**
 * Child middleware
 */
exports.childByID = function(req, res, next, id) { 
	Child.findById(id).populate('user', 'displayName').exec(function(err, child) {
		if (err) return next(err);
		if (! child) return next(new Error('Failed to load Child ' + id));
		req.child = child ;
		next();
	});
};

/**
 * Child authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.child.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
