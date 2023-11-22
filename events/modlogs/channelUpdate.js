const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const getChannelType = require('../../functions/audithelpers/getChannelType.js');

module.exports = {
	name: Events.ChannelUpdate,
	runType: 'infinity',
	async execute(client, oldChannel, newChannel) {
		// Get guild settings
		const settings = await client.getGuild(oldChannel.guild);
		if (settings.modLogId === null) return;

		// Ignore position updates, they're spammy
		if (oldChannel.rawPosition !== newChannel.rawPosition) return;

		// Fetch audit log channel
		const modLogChannel = await oldChannel.guild.channels.cache.get(settings.modLogId);
		if (!modLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(oldChannel.guild, AuditLogEvent.ChannelUpdate);
		const channelType = getChannelType(newChannel);

		// Create embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Channel Updated')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.addFields(
				{ name: 'Channel Type', value: channelType, inline: true },
				{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true },
				{ name: 'Updated By', value: `<@${executor.id}>`, inline: true }
			);

		// Channel Name
		if (oldChannel.name !== newChannel.name) {
			embed.addFields({ name: 'Name', value: `${oldChannel.name} **›** ${newChannel.name}`, inline: false });
		}

		// Channel Type
		if (oldChannel.type !== newChannel.type) {
			embed.addFields({ name: 'Type', value: `${oldChannel.type} **›** ${newChannel.type}`, inline: false });
		}

		// Channel Topic
		if (oldChannel.topic !== newChannel.topic) {
			const oldTopic = oldChannel.topic?.length > 500 ? format(oldChannel.topic, 490) : oldChannel.topic;
			const newTopic = newChannel.topic?.length > 500 ? format(newChannel.topic, 490) : newChannel.topic;

			embed.addFields({ name: 'Topic', value: `${oldTopic.length === 0 ? 'None' : oldTopic} **›** ${newTopic.length === 0 ? 'None' : newTopic}`, inline: false });
		}

		// Channel Parent
		if (oldChannel.parent !== newChannel.parent) {
			embed.addFields({ name: 'Category', value: `${oldChannel.parent.name} **›** ${newChannel.parent.name}`, inline: false });
		}

		// Channel Ratelimit
		if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
			const oldRLPU = oldChannel.rateLimitPerUser === 0 ? 'Off' : `${oldChannel.rateLimitPerUser}s`;
			const newRLPU = newChannel.rateLimitPerUser === 0 ? 'Off' : `${newChannel.rateLimitPerUser}s`;

			embed.addFields({ name: 'Slowmode', value: `${oldRLPU} **›** ${newRLPU}`, inline: false });
		}

		// Channel Bitrate
		if (oldChannel.bitrate !== newChannel.bitrate) {
			embed.addFields({ name: 'Bitrate', value: `${oldChannel.bitrate / 1000}Kbps **›** ${newChannel.bitrate / 1000}Kbps`, inline: false });
		}

		// Channel User Limit
		if (oldChannel.userLimit !== newChannel.userLimit) {
			embed.addFields({ name: 'User Limit', value: `${oldChannel.userLimit || 'Unlimited'} Users **›** ${newChannel.userLimit || 'Unlimited'} Users`, inline: false });
		}

		await modLogChannel.send({ embeds: [embed] });
	},
};

function format(text, number) {
	text = text.slice(0, number);
	return text + '...';
}
