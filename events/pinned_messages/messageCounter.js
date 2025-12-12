const { Events } = require('discord.js');
const { pinnedMessageData } = require('../../models/index');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		try {
			if (!message.guild || message.author?.bot) return;

			// Look up any pinned-message configs for this channel
			const configs = await pinnedMessageData.find({ guildId: message.guild.id, targetChannelId: message.channel.id }).lean();
			if (!configs?.length) return;

			const ops = [];
			for (const cfg of configs) {
				const next = (cfg.counter ?? 0) + 1;
				if (next >= cfg.threshold) {
					try {
						const srcChannel = await client.channels.fetch(cfg.sourceChannelId);
						const original = await srcChannel.messages.fetch(cfg.messageId, { force: true });
						if (typeof original.forward === 'function') {
							await original.forward(message.channel);
						}
					} catch (_) {
						// Ignore forwarding failures but still reset counter to avoid loops
					}

					ops.push({
						updateOne: {
							filter: { _id: cfg._id },
							update: { $set: { counter: 0, lastForwardedAt: new Date() } },
						},
					});
				} else {
					ops.push({
						updateOne: {
							filter: { _id: cfg._id },
							update: { $inc: { counter: 1 } },
						},
					});
				}
			}

			if (ops.length) await pinnedMessageData.bulkWrite(ops, { ordered: false });
		} catch (err) {
			// Do not throw within event; keep bot stable
		}
	},
};
