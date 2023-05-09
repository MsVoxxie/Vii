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
	choice1: {
		type: Number,
		default: 0,
	},
	choice2: {
		type: Number,
		default: 0,
	},
	choice3: {
		type: Number,
		default: 0,
	},
	choice4: {
		type: Number,
		default: 0,
	},
	choice5: {
		type: Number,
		default: 0,
	},
	choice6: {
		type: Number,
		default: 0,
	},
});

module.exports = model('PollData', pollDataSchema);