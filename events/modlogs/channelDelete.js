const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const getChannelType = require('../../functions/audithelpers/getChannelType.js');

module.exports = {
	name: Events.ChannelDelete,
	runType: 'infinity',
	async execute(client, channel) {
		try {
			// Check if we should audit (opt-out: skip only if explicitly set false)
			if (channel.shouldAudit === false) return;
			if (client.autoVoiceChannels.has(channel.id)) {
				client.autoVoiceChannels.delete(channel.id);
				return;
			}

			// Get guild settings
			const settings = await client.getGuild(channel.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = channel.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(channel.guild, AuditLogEvent.ChannelDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;

			const channelType = getChannelType(channel);

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.error)
				.setTitle('Channel Deleted')
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Channel ID: ${channel.id}` })
				.setTimestamp();

			if (channel.name) embed.addFields({ name: 'Channel Name', value: `#${channel.name}`, inline: false });
			if (channelType) embed.addFields({ name: 'Type', value: channelType, inline: false });
			if (channel.parent) embed.addFields({ name: 'Category', value: channel.parent.name, inline: false });
			if (executor) embed.addFields({ name: 'Deleted By', value: `<@${executor.id}>`, inline: false });
			else embed.addFields({ name: 'Deleted By', value: 'Unknown', inline: false });
			embed.addFields({ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: false });
			if (channel.topic) embed.addFields({ name: 'Topic (before deletion)', value: channel.topic.slice(0, 1024), inline: false });

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send channel delete modlog:', err);
			}
		} catch (err) {
			console.error('Error in channelDelete event:', err);
		}
	}
};
