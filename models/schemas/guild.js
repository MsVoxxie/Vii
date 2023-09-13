const { Schema, model } = require('mongoose');

const guildSchema = Schema({
	// ID's
	guildId: {
		type: String,
		required: true,
	},
	auditLogId: {
		type: String,
	},
	modLogId: {
		type: String,
	},
	levelChannelId: {
		type: String,
	},
	starboardChannelId: {
		type: String,
	},
	// Emojis
	starboardEmoji: {
		type: String,
		default: '',
		required: false,
	},
	// Numbers
	starboardLimit: {
		type: Number,
		default: 3,
		required: false,
	},
});

module.exports = model('Guild', guildSchema);
