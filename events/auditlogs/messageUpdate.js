const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.MessageUpdate,
	runType: 'infinity',
	async execute(client, oldMessage, newMessage) {
		// get guild settings
		if (newMessage.content === oldMessage.content) return;
		const settings = await client.getGuild(newMessage.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await newMessage.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(newMessage.guild, AuditLogEvent.MessageUpdate);

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Message Updated')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(`Old Message\`\`\`${oldMessage.content}\`\`\`\nNew Message\`\`\`${newMessage.content}\`\`\``)
			.addFields(
				{ name: 'Channel Name', value: newMessage.channel.url, inline: true },
				{ name: 'Message Author', value: `<@${newMessage.member.id}>`, inline: true },
				{ name: 'Updated By', value: `<@${executor.id}>`, inline: true },
				{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
