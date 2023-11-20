const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildRoleDelete,
	runType: 'infinity',
	async execute(client, role) {
		// Get guild settings
		const settings = await client.getGuild(role.guild);
		if (settings.modLogId === null) return;

		// Fetch audit log channel
		const modLogChannel = await role.guild.channels.cache.get(settings.modLogId);
		if (!modLogChannel) return;

		// Get information
		let { executor } = await getAuditLogs(role.guild, AuditLogEvent.RoleDelete);
		if (!executor) return;

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('Role Deleted')
			.setColor(client.colors.vii)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.addFields(
				{ name: 'Role', value: `${role.name}`, inline: true },
				{ name: 'Deleted By', value: `<@${executor.id}>`, inline: true },
				{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await modLogChannel.send({ embeds: [embed] });
	},
};
