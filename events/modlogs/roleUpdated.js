const { Events, AuditLogEvent, EmbedBuilder, codeBlock } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const { humanPermissions } = require('../../functions/helpers/humanFormat.js');

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
			.setDescription(`**Role:** ${oldRole}\n**Updated by:** <@${executor.id}>\n**Updated:** ${client.relTimestamp(Date.now())}`);

		// Role Name
		if (oldRole.name !== newRole.name) {
			embed.addFields({ name: 'Name', value: `${oldRole.name} **›** ${newRole.name}`, inline: false });
		}

		// Role Colors
		if (oldRole.hexColor !== newRole.hexColor) {
			embed.addFields({ name: 'Hex Color', value: `${oldRole.hexColor} **›** ${newRole.hexColor}`, inline: false });
		}

		// Role Hoisted
		if (oldRole.hoist !== newRole.hoist) {
			embed.addFields({ name: 'Hoisted', value: `${oldRole.hoist ? '`Yes`' : '`No`'} **›** ${newRole.hoist ? '`Yes`' : '`No`'}`, inline: false });
		}

		// Role Mentionable
		if (oldRole.mentionable !== newRole.mentionable) {
			embed.addFields({ name: 'Mentionable', value: `${oldRole.mentionable ? '`Yes`' : '`No`'} **›** ${newRole.mentionable ? '`Yes`' : '`No`'}`, inline: false });
		}

		// Permissions
		const addedPermissions = [];
		const removedPermissions = [];

		oldRole.permissions.toArray().forEach((perm) => {
			if (!newRole.permissions.has(perm)) {
				removedPermissions.push(humanPermissions[perm.toLowerCase()]);
			}
		});

		newRole.permissions.toArray().forEach((perm) => {
			if (!oldRole.permissions.has(perm)) {
				addedPermissions.push(humanPermissions[perm.toLowerCase()]);
			}
		});

		if (addedPermissions.length) {
			embed.addFields({
				name: 'Allowed Permissions',
				value: codeBlock(addedPermissions.map((p) => p).join(', ')),
				inline: false,
			});
		}

		if (removedPermissions.length) {
			embed.addFields({
				name: 'Denied Permissions',
				value: codeBlock(removedPermissions.map((p) => p).join(', ')),
				inline: false,
			});
		}

		// Send message
		await modLogChannel.send({ embeds: [embed] });
	},
};
