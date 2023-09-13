const { Schema, model } = require('mongoose');

const starboardSchema = Schema({
	// ID's
	guildId: {
		type: String,
		required: true,
	},
	authorId: {
		type: String,
		required: true,
	},
	messageId: {
		type: String,
		required: true,
	},
	starId: {
		type: String,
		required: true,
	},
	channelId: {
		type: String,
		required: true,
	},
	// Numbers
	starCount: {
		type: Number,
		required: true,
	},
	// Booleans
	isStarred: {
		type: Boolean,
		required: true,
	},
});

module.exports = model('StarData', starboardSchema);
