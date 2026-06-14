const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildBanAdd,
	runType: 'infinity',
	async execute(client, ban) {
		try {
			const settings = await client.getGuild(ban.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = ban.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(ban.guild, AuditLogEvent.MemberBanAdd);
			let { executor, reason, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000) executor = null;

			const embed = new EmbedBuilder()
				.setTitle('Member Banned')
				.setColor(client.colors.error)
				.setThumbnail(ban.user.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `User ID: ${ban.user.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'User', value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
					{ name: 'Banned By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Reason', value: reason || 'No reason provided', inline: false },
					{ name: 'Banned', value: client.relTimestamp(Date.now()), inline: false }
				);

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send guild ban add modlog:', err);
			}
		} catch (err) {
			console.error('Error in guildBanAdd event:', err);
		}
	},
};