const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildRoleDelete,
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
			let auditLog = await getAuditLogs(role.guild, AuditLogEvent.RoleDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;

			// Use the role's color as the embed color, fallback to error
			const embedColor = role.color !== 0 ? role.color : client.colors.error;

			// Count members that had this role
			const memberCount = role.guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size;

			// Create embed
			const embed = new EmbedBuilder()
				.setTitle('Role Deleted')
				.setColor(embedColor)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Role ID: ${role.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Role Name', value: role.name, inline: false },
				{ name: 'Color', value: role.hexColor !== '#000000' ? role.hexColor : 'Default', inline: false },
				{ name: 'Members Affected', value: `${memberCount}`, inline: false },
				{ name: 'Was Hoisted', value: role.hoist ? 'Yes' : 'No', inline: false },
				{ name: 'Was Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: false },
				{ name: 'Deleted By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: false }
				);

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send role delete modlog:', err);
			}
		} catch (err) {
			console.error('Error in roleDelete event:', err);
		}
	},
};
