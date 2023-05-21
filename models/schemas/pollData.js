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
	pollData: {
		type: Object,
		required: true,
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		channel: {
			type: String,
			required: true,
		},
	},
	pollChoices: {
		type: Array,
		required: true,
	},
	pollVotes: {
		type: Array,
		required: true,
	},
	pollVoters: {
		type: Array,
		default: [],
	},
});

module.exports = model('PollData', pollDataSchema);
