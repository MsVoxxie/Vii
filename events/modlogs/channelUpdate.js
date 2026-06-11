const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const getChannelType = require('../../functions/audithelpers/getChannelType.js');
const { format } = require('../../functions/helpers/utils.js');

module.exports = {
	name: Events.ChannelUpdate,
	runType: 'infinity',
	async execute(client, oldChannel, newChannel) {
		try {
			// Check if we should audit (opt-out: skip only if explicitly set false)
			if (oldChannel.shouldAudit === false || newChannel.shouldAudit === false) return;
			if (client.autoVoiceChannels.has(newChannel.id)) return;

			// Get guild settings
			const settings = await client.getGuild(oldChannel.guild);
			if (!settings || settings.modLogId === null) return;

			// Ignore position updates, they're spammy
			if (oldChannel.rawPosition !== newChannel.rawPosition) return;

			// Fetch audit log channel
			const modLogChannel = oldChannel.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(oldChannel.guild, AuditLogEvent.ChannelUpdate);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;
			const channelType = getChannelType(newChannel);

			// Create embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.warning)
				.setTitle('Channel Updated')
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Channel ID: ${newChannel.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Channel', value: newChannel.url || `#${newChannel.name}`, inline: false },
				{ name: 'Type', value: channelType, inline: false },
				{ name: 'Updated By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false }
				);

			// Track if anything meaningful changed
			let changed = false;

			// Channel Name
			if (oldChannel.name !== newChannel.name) {
				changed = true;
				embed.addFields({ name: 'Name', value: `${oldChannel.name} **›** ${newChannel.name}`, inline: false });
			}

			// Channel Type
			if (oldChannel.type !== newChannel.type) {
				changed = true;
				embed.addFields({ name: 'Type Changed', value: `${getChannelType(oldChannel)} **›** ${channelType}`, inline: false });
			}

			// Channel Topic
			if (oldChannel.topic !== newChannel.topic) {
				changed = true;
				const oldTopic = oldChannel.topic?.length > 500 ? format(oldChannel.topic, 490) : oldChannel.topic;
				const newTopic = newChannel.topic?.length > 500 ? format(newChannel.topic, 490) : newChannel.topic;
				embed.addFields({ name: 'Topic', value: `${oldTopic || 'None'} **›** ${newTopic || 'None'}`, inline: false });
			}

			// Channel Parent
			if (oldChannel.parent?.id !== newChannel.parent?.id) {
				changed = true;
				embed.addFields({ name: 'Category', value: `${oldChannel.parent?.name || 'None'} **›** ${newChannel.parent?.name || 'None'}`, inline: false });
			}

			// NSFW
			if (oldChannel.nsfw !== newChannel.nsfw) {
				changed = true;
				embed.addFields({ name: 'NSFW', value: `${oldChannel.nsfw ? 'Yes' : 'No'} **›** ${newChannel.nsfw ? 'Yes' : 'No'}`, inline: false });
			}

			// Channel Slowmode
			if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
				changed = true;
				const oldRLPU = oldChannel.rateLimitPerUser === 0 ? 'Off' : `${oldChannel.rateLimitPerUser}s`;
				const newRLPU = newChannel.rateLimitPerUser === 0 ? 'Off' : `${newChannel.rateLimitPerUser}s`;
				embed.addFields({ name: 'Slowmode', value: `${oldRLPU} **›** ${newRLPU}`, inline: false });
			}

			// Channel Bitrate
			if (oldChannel.bitrate !== newChannel.bitrate) {
				changed = true;
				embed.addFields({ name: 'Bitrate', value: `${(oldChannel.bitrate || 0) / 1000}kbps **›** ${(newChannel.bitrate || 0) / 1000}kbps`, inline: false });
			}

			// Channel User Limit
			if (oldChannel.userLimit !== newChannel.userLimit) {
				changed = true;
				embed.addFields({ name: 'User Limit', value: `${oldChannel.userLimit || 'Unlimited'} **›** ${newChannel.userLimit || 'Unlimited'}`, inline: false });
			}

			if (!changed) return;

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send channel update modlog:', err);
			}
		} catch (err) {
			console.error('Error in channelUpdate event:', err);
		}
	}
};
