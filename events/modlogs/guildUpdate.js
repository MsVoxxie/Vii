const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildUpdate,
	runType: 'infinity',
	async execute(client, oldGuild, newGuild) {
		try {
			// Get guild settings
			const settings = await client.getGuild(oldGuild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = oldGuild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(oldGuild, AuditLogEvent.GuildUpdate);
			const { executor } = auditLog || {};
			if (!executor) return;

			// Build Embed
			const embed = new EmbedBuilder()
				.setTitle('Guild Updated')
				.setColor(client.colors.vii)
				.setThumbnail(newGuild.iconURL())
				.setDescription(`**Updated by:** <@${executor.id}>\n**Updated:** ${client.relTimestamp(Date.now())}`)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Guild Icon
			if (oldGuild.iconURL() !== newGuild.iconURL()) {
				embed.addFields({ name: 'Icon', value: `[**Before**](${oldGuild.iconURL()}) **›** [**After**](${newGuild.iconURL()})` });
			}

			// Guild Name
			if (oldGuild.name !== newGuild.name) {
				embed.addFields({ name: 'Name', value: `__${oldGuild.name}__ **›** __${newGuild.name}__` });
			}

			// Guild Timeout
			if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
				embed.addFields({ name: 'AFK Timeout', value: `${oldGuild.afkTimeout / 60} minutes **›** ${newGuild.afkTimeout / 60} minutes` });
			}

			// Guild AFK Channel
			if (oldGuild.afkChannel !== newGuild.afkChannel) {
				embed.addFields({ name: 'AFK Channel', value: `${oldGuild.afkChannel} **›** ${newGuild.afkChannel}` });
			}

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send guild update modlog:', err);
			}
		} catch (err) {
			console.error('Error in guildUpdate event:', err);
		}
	},
};
