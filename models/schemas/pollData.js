const { Schema, model } = require('mongoose');

const pollDataSchema = Schema({
	guildId: {
		type: String,
		required: true,
	},
	pollId: {
		type: String,
		required: true,
	},
	pollChoices: {
		type: Array,
		required: true,
	},
	pollVotes: {
		type: Array,
		required: true,
	},
});

module.exports = model('PollData', pollDataSchema);
