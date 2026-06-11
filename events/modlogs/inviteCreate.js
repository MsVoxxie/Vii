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
			const inviter = invite.inviter ?? auditLog?.executor ?? null;

			// Max age in readable format
			const maxAge = invite.maxAge === 0 ? 'Never' : invite.maxAge < 3600 ? `${invite.maxAge / 60} minutes` : invite.maxAge < 86400 ? `${invite.maxAge / 3600} hours` : `${invite.maxAge / 86400} days`;

			// Create embed
			const embed = new EmbedBuilder()
				.setTitle('Invite Created')
				.setColor(client.colors.success)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Code: ${invite.code}` })
				.setTimestamp()
				.addFields(
					{ name: 'Invite Link', value: `[discord.gg/${invite.code}](https://discord.gg/${invite.code})`, inline: false },
					{ name: 'Target Channel', value: `${invite.channel?.url || 'Unknown'}`, inline: false },
				{ name: 'Created By', value: inviter ? `<@${inviter.id}>` : 'Unknown', inline: false },
				{ name: 'Max Uses', value: `${invite.maxUses === 0 ? 'Unlimited' : invite.maxUses}`, inline: false },
				{ name: 'Expires', value: invite.expiresTimestamp ? client.relTimestamp(invite.expiresTimestamp) : 'Never', inline: false },
					{ name: 'Max Age', value: maxAge, inline: false }
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
