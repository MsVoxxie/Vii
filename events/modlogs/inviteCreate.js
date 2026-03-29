const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.InviteCreate,
	runType: 'infinity',
	async execute(client, invite) {
		try {
			// Get guild settings
			const settings = await client.getGuild(invite.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = invite.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get audit log entry
			const auditLog = await getAuditLogs(invite.guild, AuditLogEvent.InviteCreate);
			let reasonId;
			if (auditLog?.reason) {
				const reasonParts = auditLog.reason.split(' ');
				reasonId = reasonParts[2]?.replace(/[<>@!]/g, '');
			}

			// Create embed
			const embed = new EmbedBuilder()
				.setTitle('Invite Created')
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Invite Code', value: `\`${invite.code}\``, inline: true },
					{ name: 'Invite Uses', value: `${invite.maxUses === 0 ? 'Infinite' : invite.maxUses}`, inline: true },
					{ name: 'Invite Expires', value: invite.expiresTimestamp === null ? 'Never' : client.relTimestamp(invite.expiresTimestamp), inline: true },
					{ name: 'Target Channel', value: `${invite.channel?.url || 'Unknown'}`, inline: true },
					{ name: 'Created By', value: `${reasonId ? `<@${reasonId}>` : invite.inviter ? ` <@${invite.inviter.id}>` : 'Unknown'}`, inline: true },
					{ name: 'Created', value: client.relTimestamp(Date.now()), inline: true }
				);

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send invite create modlog:', err);
			}
		} catch (err) {
			console.error('Error in inviteCreate event:', err);
		}
	}
};
