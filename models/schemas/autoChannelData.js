const { Schema, model } = require('mongoose');

const autoChannelSchema = Schema({
	guildId: {
		type: String,
		required: true,
	},
	masterChannels: {
		type: Array,
		default: [],
		childChannels: {
			type: Array,
			default: [],
		},
	},
});

module.exports = model('autoChannelData', autoChannelSchema);
