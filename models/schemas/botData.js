const mongoose = require('mongoose');

const botSchema = mongoose.Schema({
	// ID's
	clientId: {
		type: String,
		required: true,
	},

	// Dates
	startTime: {
		type: String,
		required: true,
	},
	startTimeUTC: {
		type: Number,
		required: true,
	},

	// Counters
	session: {
		type: Number,
		default: 0,
		required: true,
	},
	commandsExecuted: {
		type: Number,
		default: 0,
		required: true,
	},
	commandsFailed: {
		type: Number,
		default: 0,
		required: true,
	},
});

module.exports = mongoose.model('botData', botSchema);
