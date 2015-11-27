'use strict';

//http://mongoosejs.com/docs/subdocs.html



/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	var punchSchema = new Schema({punch: Date});
	
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
		type: Date,
		required: 'Please fill in child\'s date of birth'
	},
	punchesIn: [punchSchema],
	punchesOut: [punchSchema],
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	isPunchedIn: {
		type: Boolean,
		default: false
	},
	lastCheckIn: {
		type: Date
	},
	parentFirstName: {
		type: String,
		default: ''
	},
	parentLastName: {
		type: String,
		default: ''
	}
});

mongoose.model('Child', ChildSchema);
mongoose.model('Punch', punchSchema);