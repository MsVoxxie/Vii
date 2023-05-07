const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildEmojiUpdate,
	runType: 'infinity',
	async execute(client, emoji, newEmoji) {
		// Get guild settings
		const settings = await client.getGuild(emoji.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await emoji.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(emoji.guild, AuditLogEvent.EmojiUpdate);

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('Emoji Updated')
			.setThumbnail(emoji.url)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

		if (emoji.name) embed.addFields({ name: 'New Name', value: newEmoji.name, inline: true });
		embed.addFields({ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true });
		if (executor) embed.addFields({ name: 'Updated By', value: `<@${executor.id}>`, inline: true });

		// Send message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
