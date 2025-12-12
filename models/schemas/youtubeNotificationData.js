const { Schema, model } = require('mongoose');

const youtubeNotificationSchema = Schema(
	{
		guildId: {
			type: String,
			required: true,
		},
		channelId: {
			type: String,
			required: true,
		},
		ytChannelId: {
			type: String,
			required: true,
		},
		customMessage: {
			type: String,
			required: false,
		},
		lastCheckedVideo: {
			type: {
				id: {
					type: String,
					required: true,
				},
				publishDate: {
					type: Date,
					required: true,
				},
			},
			required: false,
		},
		consecutive404s: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = model('youtubeNotifcations', youtubeNotificationSchema);
