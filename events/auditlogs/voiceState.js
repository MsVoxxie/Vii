const { userData } = require('../../models/index');
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.VoiceStateUpdate,
	runType: 'infinity',
	async execute(client, oldState, newState) {
		try {
			// Check if we should audit
			if (oldState.shouldAudit === false || newState.shouldAudit === false) return;
			// Declarations
			const userId = oldState.id || newState.id;
			const guildId = oldState.guild.id || newState.guild.id;
			const curGuild = client.guilds.cache.get(guildId);
			if (!curGuild) return;

			const member = curGuild.members.cache.get(userId);
			if (member && member.bot) return;

			const settings = await client.getGuild(curGuild);
			if (!settings || settings.auditLogId === null) return;
			const auditLogChannel = curGuild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			let oldParentName, oldChannelName, oldChannelId;
			let newParentName, newChannelName, newChannelId;

			if (oldState && oldState.channel && oldState.channel.parent?.name) oldParentName = oldState.channel.parent.name;
			if (oldState && oldState.channel?.name) oldChannelName = oldState.channel.name;
			if (oldState?.channelId) oldChannelId = oldState.channelId;

			if (newState && newState.channel && newState.channel.parent?.name) newParentName = newState.channel.parent.name;
			if (newState && newState.channel?.name) newChannelName = newState.channel.name;
			if (newState?.channelId) newChannelId = newState.channelId;

			// Joined Voice Channel
			if (!oldState.channelId && newState.channelId) {
				try {
					// Database Entry
					await userData.findOneAndUpdate({ guildId: guildId, userId: userId }, { $set: { voiceState: { joinDate: Date.now() } } }, { upsert: true, new: true });

					// Build Embed
					const embed = new EmbedBuilder()
						.setTitle('User Joined Voice Channel')
						.setColor(client.colors.success)
						.setAuthor({ name: `${member?.user.tag ?? member?.id}`, iconURL: member?.displayAvatarURL() })
						.setThumbnail(member?.displayAvatarURL())
						.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
						.setFooter({ text: `User ID: ${member?.id}` })
						.setTimestamp()
						.addFields(
							{ name: 'Member', value: `<@${member?.id}>`, inline: false },
							{ name: 'Joined Channel', value: newState.channel?.url || 'Unknown', inline: false },
							{ name: 'Category', value: newState.channel?.parent?.name || 'None', inline: false },
							{ name: 'Connected', value: client.relTimestamp(Date.now()), inline: false }
						);

					// Send it
					await auditLogChannel.send({ embeds: [embed] });
				} catch (err) {
					console.error('Error in voice state join:', err);
				}
			}

			// Left Voice Channel
			if (oldState.channelId && !newState.channelId) {
				try {
					// Old Date
					const oldData = await userData.findOne({ guildId: guildId, userId: userId }).lean();
					const oldVoice = oldData?.voiceState || {};

					// Database Entry
					const newData = await userData.findOneAndUpdate(
						{ guildId: guildId, userId: userId },
						{ $set: { voiceState: { joinDate: oldVoice.joinDate || Date.now(), leaveDate: Date.now() } } },
						{ upsert: true, new: true }
					);

					// Build Embed
					const embed = new EmbedBuilder()
						.setTitle('User Left Voice Channel')
						.setColor(client.colors.error)
						.setAuthor({ name: `${member?.user.tag ?? member?.id}`, iconURL: member?.displayAvatarURL() })
						.setThumbnail(member?.displayAvatarURL())
						.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
						.setFooter({ text: `User ID: ${member?.id}` })
						.setTimestamp()
						.addFields(
							{ name: 'Member', value: `<@${member?.id}>`, inline: false },
							{ name: 'Left Channel', value: oldState.channel?.url || 'Unknown', inline: false },
							{ name: 'Category', value: oldState.channel?.parent?.name || 'None', inline: false },
							{ name: 'Disconnected', value: client.relTimestamp(Date.now()), inline: false },
							{
								name: 'Session Duration',
								value: `\`${client.getDuration(newData?.voiceState?.joinDate, newData?.voiceState?.leaveDate)?.join(' ') || 'Less than 1s'}\``,
								inline: false,
							}
						);

					// Send it
					await auditLogChannel.send({ embeds: [embed] });
				} catch (err) {
					console.error('Error in voice state leave:', err);
				}
			}

			// Switched Voice Channel
			if (oldState.channelId && newState.channelId && oldState.channel && newState.channel) {
				try {
					// False positive check
					if (oldState.channelId === newState.channelId) {
						// Check for server mute/deafen changes while staying in same channel
						const muteChanged = oldState.serverMute !== newState.serverMute;
						const deafChanged = oldState.serverDeaf !== newState.serverDeaf;

						if (muteChanged || deafChanged) {
							const changes = [];
							if (muteChanged) changes.push(newState.serverMute ? '🔇 Server Muted' : '🔊 Server Unmuted');
							if (deafChanged) changes.push(newState.serverDeaf ? '🔕 Server Deafened' : '🔔 Server Undeafened');

							const embed = new EmbedBuilder()
								.setTitle(`Voice State Updated - ${changes.join(', ')}`)
								.setColor(client.colors.warning)
								.setAuthor({ name: `${member?.user.tag ?? member?.id}`, iconURL: member?.displayAvatarURL() })
								.setThumbnail(member?.displayAvatarURL())
								.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
								.setFooter({ text: `User ID: ${member?.id}` })
								.setTimestamp()
								.addFields(
								{ name: 'Member', value: `<@${member?.id}>`, inline: false },
								{ name: 'Channel', value: newState.channel?.url || 'Unknown', inline: false }
							);

							if (muteChanged) embed.addFields({ name: 'Server Mute', value: `${oldState.serverMute ? 'Muted' : 'Unmuted'} **›** ${newState.serverMute ? 'Muted' : 'Unmuted'}`, inline: false });
							if (deafChanged) embed.addFields({ name: 'Server Deafen', value: `${oldState.serverDeaf ? 'Deafened' : 'Undeafened'} **›** ${newState.serverDeaf ? 'Deafened' : 'Undeafened'}`, inline: false });
							try {
								await auditLogChannel.send({ embeds: [embed] });
							} catch (err) {
								console.error('Error sending voice state change embed:', err);
							}
						}
						return;
					}

					// Old Date
					const oldData = await userData.findOne({ guildId: guildId, userId: userId }).lean();
					const oldVoice = oldData?.voiceState || {};

					// Database Entry
					const switchData = await userData.findOneAndUpdate(
						{ guildId: guildId, userId: userId },
						{ $set: { voiceState: { joinDate: Date.now(), leaveDate: Date.now() } } },
						{ upsert: true, new: true }
					);

					// Build Embed
					const embed = new EmbedBuilder()
						.setTitle('User Switched Voice Channels')
						.setColor(client.colors.vii)
						.setAuthor({ name: `${member?.user.tag ?? member?.id}`, iconURL: member?.displayAvatarURL() })
						.setThumbnail(member?.displayAvatarURL())
						.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
						.setFooter({ text: `User ID: ${member?.id}` })
						.setTimestamp()
						.addFields(
							{ name: 'Member', value: `<@${member?.id}>`, inline: false },
							{ name: 'From', value: oldState.channel?.url || 'Unknown', inline: false },
							{ name: 'To', value: newState.channel?.url || 'Unknown', inline: false },
							{ name: 'Switched', value: client.relTimestamp(Date.now()), inline: false },
							{
								name: 'Time in Previous Channel',
								value: `\`${client.getDuration(oldVoice?.joinDate, Date.now())?.join(' ') || 'Less than 1s'}\``,
								inline: false,
							}
						);

					// Send it
					await auditLogChannel.send({ embeds: [embed] });
				} catch (err) {
					console.error('Error in voice state switch:', err);
				}
			}
		} catch (err) {
			console.error('Error in voiceStateUpdate event:', err);
		}
	},
};
