const { Events, AuditLogEvent, EmbedBuilder, cleanCodeBlockContent, codeBlock } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.MessageDelete,
	runType: 'infinity',
	async execute(client, message) {
		// If Partial, give up
		if (message.partial) return;
		if (message.author.bot) return;
		// Get guild settings
		const settings = await client.getGuild(message.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await message.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(message.guild, AuditLogEvent.MessageDelete);

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Message Deleted')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(`${codeBlock(cleanCodeBlockContent(message.content))}`)
			.addFields(
				{ name: 'Channel Name', value: message.channel.url, inline: true },
				{ name: 'Message Author', value: `<@${message.member.id}>`, inline: true },
				{ name: 'Deleted By', value: `<@${executor.id}>`, inline: true },
				{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
