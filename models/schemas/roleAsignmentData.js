const { Schema, model } = require('mongoose');

const roleAssignmentSchema = Schema({
	guildId: {
		type: String,
		required: true,
	},
	messageId: {
		type: String,
		required: true,
	},
	channelId: {
		type: String,
		required: true,
	},
	roleId: {
		type: String,
		required: true,
	},
	emojiId: {
		type: String,
		required: true,
	},
	uniqueIdentifier: {
		type: String,
		required: true,
	},
});

module.exports = model('roleAssignmentData', roleAssignmentSchema);
