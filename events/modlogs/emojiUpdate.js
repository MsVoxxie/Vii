const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildEmojiUpdate,
	runType: 'infinity',
	async execute(client, emoji, newEmoji) {
		try {
			// Get guild settings
			const settings = await client.getGuild(emoji.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = emoji.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(emoji.guild, AuditLogEvent.EmojiUpdate);
			let { executor, createdTimestamp } = auditLog || {};
			if (!createdTimestamp || createdTimestamp > Date.now() - 5000) executor = 'Unknown';

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Emoji Updated')
				.setThumbnail(emoji.imageURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			if (emoji.name) embed.addFields({ name: 'New Name', value: newEmoji.name, inline: true });
			embed.addFields({ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true });
			if (executor) embed.addFields({ name: 'Updated By', value: `${executor}`, inline: true });

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send emoji update modlog:', err);
			}
		} catch (err) {
			console.error('Error in emojiUpdate event:', err);
		}
	},
};
