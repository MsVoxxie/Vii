const mongoose = require('mongoose');

const pollDataSchema = mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	guildId: {
		type: String,
		required: true,
	},
	pollId: {
		type: String,
		required: true,
	},
	voted: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model('PollData', pollDataSchema);
