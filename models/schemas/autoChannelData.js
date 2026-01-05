const { Schema, model } = require('mongoose');

const autoChannelSchema = Schema({
	guildId: {
		type: String,
		required: true,
	},
	masterChannels: [
		{
			masterCategoryId: String,
			masterChannelId: String,
			childDefaultName: String,
			childDefaultMaxUsers: Number,
			channelCounter: {
				type: Number,
				default: 1,
			},
			childChannels: [
				{
					childId: String,
					createdBy: String,
				},
			],
		},
	],
});

module.exports = model('autoChannelData', autoChannelSchema);
