const { Schema, model } = require('mongoose');

const pinnedMessageSchema = Schema(
	{
		guildId: { type: String, required: true, index: true },
		// The original message to forward repeatedly
		sourceChannelId: { type: String, required: true },
		messageId: { type: String, required: true },
		// The channel where the message should be kept "pinned"
		targetChannelId: { type: String, required: true, index: true },
		// Number of normal messages between re-forwards
		threshold: { type: Number, required: true, min: 1 },
		// Running count of messages since last forward
		counter: { type: Number, default: 0 },
		lastForwardedAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

// Ensure uniqueness per target channel + source message to avoid duplicates
pinnedMessageSchema.index({ guildId: 1, targetChannelId: 1, messageId: 1 }, { unique: true });

module.exports = model('pinnedMessageData', pinnedMessageSchema);
