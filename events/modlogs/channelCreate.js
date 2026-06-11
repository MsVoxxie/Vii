const { Events, AuditLogEvent, EmbedBuilder, ChannelType } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const getChannelType = require('../../functions/audithelpers/getChannelType.js');
const { autoChannelData } = require('../../models/index.js');

module.exports = {
	name: Events.ChannelCreate,
	runType: 'infinity',
	async execute(client, channel) {
		try {
			// Check if we should audit (opt-out: skip only if explicitly set false)
			if (channel.shouldAudit === false) return;
			if (client.autoVoiceChannels.has(channel.id)) {
				client.autoVoiceChannels.delete(channel.id);
				return;
			}

			// Suppress voice channels created in autovoice categories (child channels created before ID is known)
			if (channel.type === ChannelType.GuildVoice && channel.parentId) {
				const isAutoVoiceCategory = await autoChannelData.exists({
					guildId: channel.guild.id,
					'masterChannels.masterCategoryId': channel.parentId,
				});
				if (isAutoVoiceCategory) return;
			}

			// Get guild settings
			const settings = await client.getGuild(channel.guild);
			if (!settings || settings.modLogId === null) return;

			// Fetch audit log channel
			const modLogChannel = channel.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(channel.guild, AuditLogEvent.ChannelCreate);
			const { executor } = auditLog || {};
			const channelType = getChannelType(channel);

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.success)
				.setTitle('Channel Created')
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Channel ID: ${channel.id}` })
				.setTimestamp();

			if (channel.name) embed.addFields({ name: 'Channel', value: channel.url, inline: false });
			if (channelType) embed.addFields({ name: 'Type', value: channelType, inline: false });
			if (channel.parent) embed.addFields({ name: 'Category', value: channel.parent.name, inline: false });
			embed.addFields({ name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: false });
			if (executor) embed.addFields({ name: 'Created By', value: `<@${executor.id}>`, inline: false });
			embed.addFields({ name: 'Created', value: client.relTimestamp(Date.now()), inline: false });
			if (channel.topic) embed.addFields({ name: 'Topic', value: channel.topic.slice(0, 1024), inline: false });
			if (channel.rateLimitPerUser) embed.addFields({ name: 'Slowmode', value: `${channel.rateLimitPerUser}s`, inline: false });

			// Send message
			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send channel create modlog:', err);
			}
		} catch (err) {
			console.error('Error in channelCreate event:', err);
		}
	},
};
