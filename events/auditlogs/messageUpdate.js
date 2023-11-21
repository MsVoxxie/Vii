const { Events, AuditLogEvent, EmbedBuilder, cleanCodeBlockContent, codeBlock } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.MessageUpdate,
	runType: 'infinity',
	async execute(client, oldMessage, newMessage) {
		// Checks
		if (newMessage.author.bot) return;
		if (newMessage.content?.toString() === oldMessage.content?.toString()) return;
		if (!oldMessage.content || !newMessage.content) return;

		// Get guild settings
		const settings = await client.getGuild(newMessage.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await newMessage.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Message Updated')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(`Old Message${codeBlock(cleanCodeBlockContent(oldMessage.content))}\nNew Message${codeBlock(cleanCodeBlockContent(newMessage.content))}`)
			.addFields(
				{ name: 'Channel Name', value: newMessage.channel.url, inline: true },
				{ name: 'Message Author', value: `<@${newMessage.member.id}>`, inline: true },
				{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
