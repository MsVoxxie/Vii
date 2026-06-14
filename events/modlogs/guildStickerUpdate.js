const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildStickerUpdate,
	runType: 'infinity',
	async execute(client, oldSticker, newSticker) {
		try {
			const settings = await client.getGuild(oldSticker.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = oldSticker.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(oldSticker.guild, AuditLogEvent.StickerUpdate);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000) executor = null;

			const embed = new EmbedBuilder()
				.setTitle('Sticker Updated')
				.setColor(client.colors.warning)
				.setThumbnail(newSticker.url)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Sticker ID: ${newSticker.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Sticker', value: newSticker.name, inline: false },
					{ name: 'Updated By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: false }
				);

			if (oldSticker.name !== newSticker.name) {
				embed.addFields({ name: 'Name', value: `${oldSticker.name} **›** ${newSticker.name}`, inline: false });
			}

			if (oldSticker.description !== newSticker.description) {
				embed.addFields({
					name: 'Description',
					value: `${oldSticker.description || 'None'} **›** ${newSticker.description || 'None'}`,
					inline: false,
				});
			}

			if (embed.data.fields.length <= 3) return;

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send sticker update modlog:', err);
			}
		} catch (err) {
			console.error('Error in guildStickerUpdate event:', err);
		}
	},
};