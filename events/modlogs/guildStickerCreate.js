const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildStickerCreate,
	runType: 'infinity',
	async execute(client, sticker) {
		try {
			const settings = await client.getGuild(sticker.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = sticker.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(sticker.guild, AuditLogEvent.StickerCreate);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000) executor = null;

			const embed = new EmbedBuilder()
				.setTitle('Sticker Created')
				.setColor(client.colors.success)
				.setThumbnail(sticker.url)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Sticker ID: ${sticker.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Name', value: sticker.name, inline: false },
					{ name: 'Description', value: sticker.description || 'None', inline: false },
					{ name: 'Created By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Created', value: client.relTimestamp(Date.now()), inline: false }
				);

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send sticker create modlog:', err);
			}
		} catch (err) {
			console.error('Error in guildStickerCreate event:', err);
		}
	},
};
