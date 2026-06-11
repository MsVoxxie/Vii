const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildMemberUpdate,
	runType: 'infinity',
	async execute(client, oldMember, newMember) {
		try {
			// Checks
			if (oldMember === newMember) return;

			// Get guild settings
			const settings = await client.getGuild(oldMember.guild);
			if (!settings || settings.auditLogId === null) return;

			// Fetch audit log channel
			const auditLogChannel = oldMember.guild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			// Declarations
			const oldAvatar = oldMember.displayAvatarURL({ size: 256 });
			const newAvatar = newMember.displayAvatarURL({ size: 256 });
			let changed = false;
			const changesList = [];

			// Create Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.warning)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `User ID: ${newMember.id}` })
				.setTimestamp();

			// Avatar
			if (oldAvatar !== newAvatar) {
				changed = true;
				changesList.push('Avatar');
				embed
					.setThumbnail(newAvatar)
					.addFields({ name: 'Avatar', value: `[**Before**](${oldAvatar}) **›** [**After**](${newAvatar})`, inline: false });
			} else {
				embed.setThumbnail(newMember.displayAvatarURL());
			}

			// Username
			if (oldMember.user.username !== newMember.user.username) {
				changed = true;
				changesList.push('Username');
				embed.addFields({ name: 'Username', value: `${oldMember.user.username} **›** ${newMember.user.username}`, inline: false });
			}

			// Global Display Name
			if (oldMember.user.globalName !== newMember.user.globalName) {
				changed = true;
				changesList.push('Display Name');
				embed.addFields({
					name: 'Display Name',
					value: `${oldMember.user.globalName ?? oldMember.user.username} **›** ${newMember.user.globalName ?? newMember.user.username}`,
					inline: false,
				});
			}

			// Nickname
			if (oldMember.nickname !== newMember.nickname) {
				changed = true;
				changesList.push('Nickname');
				let auditLog = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberUpdate);
				let { executor } = auditLog || {};

				embed.addFields(
					{
						name: 'Nickname',
						value: `${oldMember.nickname ?? oldMember.user.username} **›** ${newMember.nickname ?? newMember.user.username}`,
						inline: false,
					},
					{
						name: 'Changed By',
						value: executor ? `<@${executor.id}>` : `<@${newMember.id}> (self)`,
						inline: false,
					}
				);
			}

			// Timeout
			if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
				changed = true;
				let auditLog = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberUpdate);
				let { executor, reason } = auditLog || {};
				const isTimedOut = newMember.communicationDisabledUntilTimestamp !== null;

				if (isTimedOut) {
					changesList.push('Timed Out');
					embed.addFields(
						{ name: 'Timed Out Until', value: client.relTimestamp(newMember.communicationDisabledUntilTimestamp), inline: false },
						{ name: 'Timed Out By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
						{ name: 'Reason', value: reason || 'No reason provided', inline: false }
					);
				} else {
					changesList.push('Timeout Removed');
					embed.addFields(
						{ name: 'Timeout', value: 'Removed', inline: false },
						{ name: 'Removed By', value: executor ? `<@${executor.id}>` : 'Timeout expired', inline: false }
					);
				}
			}

			// Roles
			const removedRoles = oldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id) && r.id !== oldMember.guild.id);
			const addedRoles = newMember.roles.cache.filter((r) => !oldMember.roles.cache.has(r.id) && r.id !== newMember.guild.id);

			if (removedRoles.size > 0) {
				changed = true;
				changesList.push('Roles Removed');
				let auditLog = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberRoleUpdate);
				let { executor } = auditLog || {};

				embed.addFields(
					{ name: 'Roles Removed', value: removedRoles.map((r) => `<@&${r.id}>`).join(', '), inline: false },
					{ name: 'Removed By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false }
				);
			}

			if (addedRoles.size > 0) {
				changed = true;
				changesList.push('Roles Added');
				let auditLog = await getAuditLogs(oldMember.guild, AuditLogEvent.MemberRoleUpdate);
				let { executor } = auditLog || {};

				embed.addFields(
					{ name: 'Roles Added', value: addedRoles.map((r) => `<@&${r.id}>`).join(', '), inline: false },
					{ name: 'Added By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false }
				);
			}

			// Server Boost
			if (oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp) {
				changed = true;
				if (newMember.premiumSinceTimestamp) {
					changesList.push('Started Boosting');
					embed.addFields({ name: 'Boosting Since', value: client.relTimestamp(newMember.premiumSinceTimestamp), inline: false });
				} else {
					changesList.push('Stopped Boosting');
					embed.addFields({ name: 'Was Boosting Since', value: client.relTimestamp(oldMember.premiumSinceTimestamp), inline: false });
				}
			}

			// Membership Screening (Pending)
			if (oldMember.pending !== newMember.pending) {
				changed = true;
				changesList.push('Passed Screening');
				embed.addFields({ name: 'Membership Screening', value: 'Pending **›** Passed', inline: false });
			}

			// Skip if no recognised change was detected
			if (!changed) return;

			// Build title and description from collected changes
			const title = changesList.length === 1 ? `Member ${changesList[0]}` : `Member Updated — ${changesList.join(', ')}`;
			embed.setTitle(title).setDescription(`**Member:** <@${newMember.id}>`);

			// Send Message
			try {
				await auditLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send member update audit log:', err);
			}
		} catch (err) {
			console.error('Error in guildMemberUpdate event:', err);
		}
	},
};
