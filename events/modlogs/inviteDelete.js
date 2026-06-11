const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.InviteDelete,
	runType: 'infinity',
	async execute(client, invite) {
		try {
			// Get guild settings
			const settings = await client.getGuild(invite.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = invite.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(invite.guild, AuditLogEvent.InviteDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;

			// Create embed
			const embed = new EmbedBuilder()
				.setTitle('Invite Deleted')
				.setColor(client.colors.error)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Code: ${invite.code}` })
				.setTimestamp()
				.addFields(
					{ name: 'Invite Code', value: `\`${invite.code}\``, inline: false },
				{ name: 'Total Uses', value: `${invite.uses ?? 0}`, inline: false },
				{ name: 'Deleted By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: false }
				);

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send invite delete modlog:', err);
			}
		} catch (err) {
			console.error('Error in inviteDelete event:', err);
		}
	}
};
