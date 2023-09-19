const { Schema, model } = require('mongoose');

const userSchema = Schema({
	// ID's
	guildId: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},

	// Voice State Data
	voiceState: {
		channelId: {
			type: String,
		},
		joinDate: {
			type: Date,
		},
		leaveDate: {
			type: Date,
		},
	},
});

module.exports = model('userData', userSchema);
