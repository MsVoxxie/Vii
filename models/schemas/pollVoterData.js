const { Schema, model } = require('mongoose');

const pollVoterDataSchema = Schema({
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

module.exports = model('PollVoterData', pollVoterDataSchema);
