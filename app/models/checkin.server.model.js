'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Checkin Schema
 */
var CheckinSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Checkin name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Checkin', CheckinSchema);