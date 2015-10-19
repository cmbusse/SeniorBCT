'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Child Schema
 */
var ChildSchema = new Schema({
	firstName: {
		type: String,
		default: '',
		required: 'Please fill child\'s first name',
		trim: true
	},
	lastName: {
		type: String,
		default: '',
		required: 'Please fill child\'s last name',
		trim: true
	},
	dob: {
		type: String,
		required: 'Please fill in child\'s date of birth'
	},
	timePunches: [{
		dateTimeIn: String,
		dateTimeOut: String
		/* TODO - If Time Allows
		Add a way to track edits to the time punches
		Tracks if an entry has been edited
		Who it was edited by
		What the changes were
		*/
	}],
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Child', ChildSchema);
