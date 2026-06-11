const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.GuildMemberRemove,
	runType: 'infinity',
	async execute(client, member) {
		try {
			// Declarations
			const settings = await client.getGuild(member.guild);

			// Checks
			if (member.id === client.user.id) return;
			if (!settings) return;

			// Determine leave type via audit log
			let leaveType = 'Left';
			let executor = null;
			let reason = null;

			// Check for recent kick
			const kickLog = await getAuditLogs(member.guild, AuditLogEvent.MemberKick);
			if (kickLog?.target?.id === member.id && kickLog?.createdTimestamp && Date.now() - kickLog.createdTimestamp < 5000) {
				leaveType = 'Kicked';
				executor = kickLog.executor;
				reason = kickLog.reason;
			}

			// Check for recent ban
			if (leaveType === 'Left') {
				const banLog = await getAuditLogs(member.guild, AuditLogEvent.MemberBanAdd);
				if (banLog?.target?.id === member.id && banLog?.createdTimestamp && Date.now() - banLog.createdTimestamp < 5000) {
					leaveType = 'Banned';
					executor = banLog.executor;
					reason = banLog.reason;
				}
			}

			// Calculate time in server
			const joinedAt = member.joinedTimestamp;
			const timeInServer = joinedAt ? client.getDuration(joinedAt, Date.now())?.join(' ') || 'Unknown' : 'Unknown';

			// Get roles (exclude @everyone), sorted by position
			const roles = member.roles.cache
				.filter((r) => r.id !== member.guild.id)
				.sort((a, b) => b.position - a.position)
				.map((r) => `<@&${r.id}>`);
			const rolesDisplay = roles.length > 0 ? (roles.length > 10 ? roles.slice(0, 10).join(', ') + ` *(+${roles.length - 10} more)*` : roles.join(', ')) : 'None';



			// Check for Audit Channel to send logs to.
			const auditLogChannel = member.guild.channels.cache.get(settings.auditLogId);
			if (auditLogChannel) {
				try {
					// Build Embed
					const embed = new EmbedBuilder()
						.setColor(client.colors.error)
						.setTitle(`Member ${leaveType}`)
						.setAuthor({ name: `${member.user.tag} (${member.id})`, iconURL: member.displayAvatarURL() })
						.setThumbnail(member.displayAvatarURL())
						.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
						.setFooter({ text: `User ID: ${member.id} • ${member.guild.memberCount.toLocaleString()} members remaining` })
						.setTimestamp()
						.addFields(
							{ name: 'Member', value: `${member.user.tag}`, inline: false },
							{ name: 'Joined', value: joinedAt ? client.relTimestamp(joinedAt) : 'Unknown', inline: false },
							{ name: 'Time in Server', value: `\`${timeInServer}\``, inline: false }
						);

					if (leaveType !== 'Left') {
						embed.addFields(
							{ name: `${leaveType} By`, value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
							{ name: 'Reason', value: reason || 'No reason provided', inline: false }
						);
					}

					embed.addFields({ name: `Roles (${roles.length})`, value: rolesDisplay, inline: false });

					// Send message
					await auditLogChannel.send({ embeds: [embed] });
				} catch (err) {
					console.error('Failed to send member leave audit log:', err);
				}
			}

			// Check for a Leave Channel to send departure message to.
			const leaveChannel = member.guild.channels.cache.get(settings.leaveChannelId);
			if (leaveChannel) {
				try {
					// Build Embed
					const embed = new EmbedBuilder()
						.setColor(client.colors.vii)
						.setTitle(member.user.tag)
						.setDescription(`${member.displayName} has left the server.`)
						.setThumbnail(member.displayAvatarURL())
						.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

					// Send message
					await leaveChannel.send({ embeds: [embed] });
				} catch (err) {
					console.error('Failed to send leave channel message:', err);
				}
			}
		} catch (err) {
			console.error('Error in guildMemberRemove event:', err);
		}
	},
};
