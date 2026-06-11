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

			// Use the role's color as the embed color, fallback to success
			const embedColor = role.color !== 0 ? role.color : client.colors.success;

			// Create embed
			const embed = new EmbedBuilder()
				.setTitle('Role Created')
				.setColor(embedColor)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Role ID: ${role.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Role', value: `<@&${role.id}>`, inline: false },
				{ name: 'Color', value: role.hexColor !== '#000000' ? role.hexColor : 'Default', inline: false },
				{ name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: false },
				{ name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: false },
				{ name: 'Created By', value: `<@${executor.id}>`, inline: false },
					{ name: 'Created', value: client.relTimestamp(Date.now()), inline: false }
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
