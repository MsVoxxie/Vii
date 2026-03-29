const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildRoleCreate,
	runType: 'infinity',
	async execute(client, role) {
		try {
			// Get guild settings
			const settings = await client.getGuild(role.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = role.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(role.guild, AuditLogEvent.RoleCreate);
			let { executor } = auditLog || {};
			if (!executor) return;

			// Create embed
			const embed = new EmbedBuilder()
				.setTitle('Role Created')
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Role', value: `${role.name}`, inline: true },
					{ name: 'Role Color', value: `${role.hexColor}`, inline: true },
					{ name: 'Created By', value: `<@${executor?.id || 'Unknown'}>`, inline: true },
					{ name: 'Created', value: client.relTimestamp(Date.now()), inline: true }
				);

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send role create modlog:', err);
			}
		} catch (err) {
			console.error('Error in roleCreate event:', err);
		}
	},
};
