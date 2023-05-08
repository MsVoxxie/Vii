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

	// Colors
	guildColorHex: {
		type: String,
		default: '3cdefc',
		required: true,
	},
});

module.exports = model('Guild', guildSchema);
