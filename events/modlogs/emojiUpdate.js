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
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.warning)
				.setTitle('Emoji Updated')
				.setThumbnail(newEmoji.imageURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Emoji ID: ${emoji.id}` })
				.setTimestamp();

			if (emoji.name !== newEmoji.name) embed.addFields({ name: 'Name', value: `:${emoji.name}: **›** :${newEmoji.name}:`, inline: false });
			else embed.addFields({ name: 'Name', value: `:${newEmoji.name}:`, inline: false });
			embed.addFields({ name: 'Preview', value: newEmoji.toString(), inline: false });
			if (executor) embed.addFields({ name: 'Updated By', value: `<@${executor.id}>`, inline: false });
			else embed.addFields({ name: 'Updated By', value: 'Unknown', inline: false });
			embed.addFields({ name: 'Updated', value: client.relTimestamp(Date.now()), inline: false });

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
