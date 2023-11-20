const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.InviteDelete,
	runType: 'infinity',
	async execute(client, invite) {
		// Get guild settings
		const settings = await client.getGuild(invite.guild);
		if (settings.modLogId === null) return;

		// Fetch audit log channel
		const modLogChannel = await invite.guild.channels.cache.get(settings.modLogId);
		if (!modLogChannel) return;

		// Get information
		const { executor } = await getAuditLogs(invite.guild, AuditLogEvent.MessageDelete);
		if (!executor) return;

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('Invite Deleted')
			.setColor(client.colors.vii)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.addFields(
				{ name: 'Invite Code', value: `\`${invite.code}\``, inline: true },
				{ name: 'Invite Uses', value: `${invite.uses === null ? '0' : invite.uses}`, inline: true },
				{ name: 'Deleted By', value: `<@${executor.id}>`, inline: true },
				{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await modLogChannel.send({ embeds: [embed] });
	},
};
