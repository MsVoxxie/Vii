const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.InviteCreate,
	runType: 'infinity',
	async execute(client, invite) {
		// Get guild settings
		const settings = await client.getGuild(invite.guild);
		if (settings.modLogId === null) return;

		// Fetch audit log channel
		const modLogChannel = await invite.guild.channels.cache.get(settings.modLogId);
		if (!modLogChannel) return;

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('Invite Created')
			.setColor(client.colors.vii)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.addFields(
				{ name: 'Invite Code', value: `\`${invite.code}\``, inline: true },
				{ name: 'Invite Uses', value: `${invite.maxUses === 0 ? 'Infinite' : invite.maxUses}`, inline: true },
				{ name: 'Invite Expires', value: invite.expiresTimestamp === null ? 'Never' : client.relTimestamp(invite.expiresTimestamp), inline: true },
				{ name: 'Target Channel', value: `${invite.channel.url}`, inline: true },
				{ name: 'Created By', value: `<@${invite.inviter.id}>`, inline: true },
				{ name: 'Created', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await modLogChannel.send({ embeds: [embed] });
	},
};
