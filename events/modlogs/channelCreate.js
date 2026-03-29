const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const getChannelType = require('../../functions/audithelpers/getChannelType.js');

module.exports = {
	name: Events.ChannelCreate,
	runType: 'infinity',
	async execute(client, channel) {
		try {
			// Check if we should audit
			if (!channel.shouldAudit) return;

			// Get guild settings
			const settings = await client.getGuild(channel.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = channel.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(channel.guild, AuditLogEvent.ChannelCreate);
			const { executor } = auditLog || {};
			const channelType = getChannelType(channel);

			// Build Embed
			const embed = new EmbedBuilder().setColor(client.colors.vii).setTitle('Channel Created').setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			if (channel.name) embed.addFields({ name: 'Channel Name', value: channel.url, inline: true });
			if (channelType) embed.addFields({ name: 'Channel Type', value: channelType, inline: true });
			if (channel.id) embed.addFields({ name: 'Channel ID', value: channel.id, inline: true });
			if (channel.parent) embed.addFields({ name: 'Parent Channel', value: channel.parent.name, inline: true });
			embed.addFields({ name: 'Created', value: client.relTimestamp(Date.now()), inline: true });
			if (executor) embed.addFields({ name: 'Created By', value: `<@${executor.id}>`, inline: true });

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send channel create modlog:', err);
			}
		} catch (err) {
			console.error('Error in channelCreate event:', err);
		}
	},
};
