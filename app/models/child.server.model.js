'use strict';

//http://mongoosejs.com/docs/subdocs.html



/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	var punchSchema = new Schema({
		punch: {
			type: Date
		},
		dayCampMode: {
			type: Boolean,
			default: false
		}
	});
	
/**
 * Child Schema
 */
 // TODO: 	Implement a boolean called DayCamp.  True for DayCamp pricing model, False for Latch key pricing model.  
 //			Manage Payment Plan dashboard will go through all children and set the pricing model appropriately for All Children
 //			Upon child creation, look up another child and see what their DayCamp value is and copy it
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
	},
	inToOut: {
		type: Boolean,
		default: false
	},
	outToIn: {
		type: Boolean,
		default: false
	},
	dayCampMode: {
		type: Boolean,
		default: false
	}
});

mongoose.model('Child', ChildSchema);
mongoose.model('Punch', punchSchema);