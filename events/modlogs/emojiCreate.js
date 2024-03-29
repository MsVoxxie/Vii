const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildEmojiCreate,
	runType: 'infinity',
	async execute(client, emoji) {
		// Get guild settings
		const settings = await client.getGuild(emoji.guild);
		if (settings.modLogId === null) return;

		// Fetch audit log channel
		const modLogChannel = await emoji.guild.channels.cache.get(settings.modLogId);
		if (!modLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(emoji.guild, AuditLogEvent.EmojiCreate);

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Emoji Created')
			.setThumbnail(emoji.imageURL())
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

		if (emoji.name) embed.addFields({ name: 'Name', value: emoji.name, inline: true });
		embed.addFields({ name: 'Created', value: client.relTimestamp(Date.now()), inline: true });
		if (executor) embed.addFields({ name: 'Created By', value: `<@${executor.id}>`, inline: true });

		// Send message
		await modLogChannel.send({ embeds: [embed] });
	},
};
