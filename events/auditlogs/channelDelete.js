const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const getChannelType = require('../../functions/audithelpers/getChannelType.js');

module.exports = {
	name: Events.ChannelDelete,
	runType: 'infinity',
	async execute(client, channel) {
		// Get guild  settings
		const settings = await client.getGuild(channel.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await channel.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(channel.guild, AuditLogEvent.ChannelDelete);
		const channelType = getChannelType(channel);

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('Channel Deleted')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

		if (channel.name) embed.addFields({ name: 'Channel Name', value: channel.name, inline: true });
		if (channelType) embed.addFields({ name: 'Channel Type', value: channelType, inline: true });
		if (channel.id) embed.addFields({ name: 'Channel ID', value: channel.id, inline: true });
		if (channel.parent) embed.addFields({ name: 'Parent Channel', value: channel.parent.name, inline: true });
		embed.addFields({ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: true });
		if (executor) embed.addFields({ name: 'Deleted By', value: `<@${executor.id}>`, inline: true });

		// Send message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
