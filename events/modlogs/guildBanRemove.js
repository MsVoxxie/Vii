const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildBanRemove,
	runType: 'infinity',
	async execute(client, ban) {
		try {
			const settings = await client.getGuild(ban.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = ban.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(ban.guild, AuditLogEvent.MemberBanRemove);
			let { executor, reason, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000) executor = null;

			const embed = new EmbedBuilder()
				.setTitle('Member Unbanned')
				.setColor(client.colors.success)
				.setThumbnail(ban.user.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `User ID: ${ban.user.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'User', value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
					{ name: 'Unbanned By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Reason', value: reason || 'No reason provided', inline: false },
					{ name: 'Unbanned', value: client.relTimestamp(Date.now()), inline: false }
				);

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send guild ban remove modlog:', err);
			}
		} catch (err) {
			console.error('Error in guildBanRemove event:', err);
		}
	},
};
