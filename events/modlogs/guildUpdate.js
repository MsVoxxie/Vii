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
				.setTitle('Server Updated')
				.setColor(client.colors.warning)
				.setThumbnail(newGuild.iconURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Server ID: ${newGuild.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Updated By', value: `<@${executor.id}>`, inline: false },
					{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: false }
				);

			// Guild Icon
			if (oldGuild.iconURL() !== newGuild.iconURL()) {
				embed.addFields({ name: 'Icon', value: `[**Before**](${oldGuild.iconURL() || 'None'}) **›** [**After**](${newGuild.iconURL() || 'None'})`, inline: false });
			}

			// Guild Name
			if (oldGuild.name !== newGuild.name) {
				embed.addFields({ name: 'Name', value: `${oldGuild.name} **›** ${newGuild.name}`, inline: false });
			}

			// Guild Description
			if (oldGuild.description !== newGuild.description) {
				embed.addFields({ name: 'Description', value: `${oldGuild.description || 'None'} **›** ${newGuild.description || 'None'}`, inline: false });
			}

			// Verification Level
			const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Very High'];
			if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
				embed.addFields({
					name: 'Verification Level',
					value: `${verificationLevels[oldGuild.verificationLevel] ?? oldGuild.verificationLevel} **›** ${verificationLevels[newGuild.verificationLevel] ?? newGuild.verificationLevel}`,
					inline: false,
				});
			}

			// MFA Level
			if (oldGuild.mfaLevel !== newGuild.mfaLevel) {
				embed.addFields({ name: '2FA Requirement', value: `${oldGuild.mfaLevel === 1 ? 'Required' : 'Not Required'} **›** ${newGuild.mfaLevel === 1 ? 'Required' : 'Not Required'}`, inline: false });
			}

			// AFK Timeout
			if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
				embed.addFields({ name: 'AFK Timeout', value: `${oldGuild.afkTimeout / 60} min **›** ${newGuild.afkTimeout / 60} min`, inline: false });
			}

			// AFK Channel
			if (oldGuild.afkChannelId !== newGuild.afkChannelId) {
				embed.addFields({ name: 'AFK Channel', value: `${oldGuild.afkChannel ?? 'None'} **›** ${newGuild.afkChannel ?? 'None'}`, inline: false });
			}

			// Banner
			if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
				embed.addFields({ name: 'Banner', value: `[**Before**](${oldGuild.bannerURL() ?? 'None'}) **›** [**After**](${newGuild.bannerURL() ?? 'None'})`, inline: false });
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
