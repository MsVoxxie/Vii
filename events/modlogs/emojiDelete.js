const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildEmojiDelete,
	runType: 'infinity',
	async execute(client, emoji) {
		try {
			// Get guild settings
			const settings = await client.getGuild(emoji.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = emoji.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(emoji.guild, AuditLogEvent.EmojiDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.error)
				.setTitle('Emoji Deleted')
				.setThumbnail(emoji.imageURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Emoji ID: ${emoji.id}` })
				.setTimestamp();

			embed.addFields({ name: 'Name', value: `:${emoji.name}:`, inline: false });
			embed.addFields({ name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: false });
			if (executor) embed.addFields({ name: 'Deleted By', value: `<@${executor.id}>`, inline: false });
			else embed.addFields({ name: 'Deleted By', value: 'Unknown', inline: false });
			embed.addFields({ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: false });

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send emoji delete modlog:', err);
			}
		} catch (err) {
			console.error('Error in emojiDelete event:', err);
		}
	}
};
