const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildRoleUpdate,
	runType: 'infinity',
	async execute(client, oldRole, newRole) {
		// Checks
		if (oldRole === newRole) return;
		if (oldRole.position !== newRole.position) return;

		// Get guild settings
		const settings = await client.getGuild(oldRole.guild);
		if (settings.modLogId === null) return;

		// Fetch audit log channel
		const modLogChannel = await oldRole.guild.channels.cache.get(settings.modLogId);
		if (!modLogChannel) return;

		// Get information
		let { executor } = await getAuditLogs(oldRole.guild, AuditLogEvent.RoleUpdate);
		if (!executor) return console.log('no executor');

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('Role Updated')
			.setColor(client.colors.vii)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.addFields(
				{ name: 'Old Role', value: `${oldRole.name}`, inline: true },
				{ name: 'New Role', value: `${newRole.name}`, inline: true },
				{ name: 'Old Color', value: `${oldRole.hexColor}`, inline: true },
				{ name: 'New Color', value: `${newRole.hexColor}`, inline: true },
				{ name: 'Updated By', value: `<@${executor.id}>`, inline: true },
				{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Send message
		await modLogChannel.send({ embeds: [embed] });
	},
};
