const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildMemberUpdate,
	runType: 'infinity',
	async execute(client, oldMember, newMember) {
		// Checks
		if (oldMember === newMember) return;

		// Get guild settings
		const settings = await client.getGuild(oldMember.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await oldMember.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Declarations
		const oldAvatar = oldMember.displayAvatarURL();
		const newAvatar = newMember.displayAvatarURL();

		// Create Embed
		const embed = new EmbedBuilder()
			.setTitle('Member Updated')
			.setColor(client.colors.vii)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(`**Member:** ${oldMember.displayName}\n**Updated:** ${client.relTimestamp(Date.now())}`)
			.setThumbnail(oldAvatar);

		// Avatar
		if (oldAvatar !== newAvatar) {
			embed.addFields({ name: 'Avatar', value: `[**[Before]**](${oldAvatar}) **›** [**[After]**](${newAvatar})`, inline: false });
		}

		// Username
		if (oldMember.user.username !== newMember.user.username) {
			embed.addFields({ name: 'Username', value: `${oldMember.user.username} **›** ${newMember.user.username}`, inline: false });
		}

		// Nickname
		if (oldMember.nickname !== newMember.nickname) {
			// Get information
			let { executor } = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberUpdate);

			embed.addFields(
				{
					name: 'Nickname',
					value: `${oldMember.nickname === null ? `${oldMember.displayName}` : oldMember.nickname} **›** ${
						newMember.nickname === null ? `${newMember.displayName}` : newMember.nickname
					}`,
					inline: false,
				},
				{
					name: 'Nickname Updated By',
					value: `${executor ? `<@${executor.id}>` : `<@${oldMember.id}>`}`,
					inline: false,
				}
			);
		}

		// Timeout
		if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
			// Get information
			let { executor, reason } = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberUpdate);

			embed.addFields(
				{
					name: 'Timeout',
					value: `Ending **›** ${newMember.communicationDisabledUntilTimestamp === null ? 'Now' : client.relTimestamp(newMember.communicationDisabledUntilTimestamp)}`,
					inline: false,
				},
				{
					name: 'Reason',
					value: `${reason ? reason : 'No Reason Provided'}`,
					inline: false,
				},
				{
					name: 'Timeout Updated By',
					value: `${executor ? `<@${executor.id}>` : 'Timeout has expired'}`,
					inline: false,
				}
			);
		}

		// Roles
		let removedRoles = [];
		let addedRoles = [];

		oldMember.roles.cache.forEach((role) => {
			if (!newMember.roles.cache.has(role.id)) {
				removedRoles.push(role);
			}
		});

		newMember.roles.cache.forEach((role) => {
			if (!oldMember.roles.cache.has(role.id)) {
				addedRoles.push(role);
			}
		});

		if (oldMember.roles.cache.size > newMember.roles.cache.size) {
			// Get information
			let { executor } = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberRoleUpdate);

			embed.addFields(
				{
					name: 'Removed Roles',
					value: removedRoles.map((p) => p).join(', '),
					inline: true,
				},
				{
					name: 'Roles Removed By',
					value: `<@${executor.id}>`,
					inline: true,
				}
			);
		}

		if (oldMember.roles.cache.size < newMember.roles.cache.size) {
			// Get information
			let { executor } = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberRoleUpdate);

			embed.addFields(
				{
					name: 'Added Roles',
					value: addedRoles.map((p) => p).join(', '),
					inline: true,
				},
				{
					name: 'Roles Added By',
					value: `<@${executor.id}>`,
					inline: true,
				}
			);
		}

		// Send Message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
