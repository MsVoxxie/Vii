const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
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

	// Colors
	guildColorHex: {
		type: String,
		default: '3cdefc',
		required: true,
	},
});

module.exports = mongoose.model('Guild', guildSchema);
