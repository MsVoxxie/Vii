const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.WebhooksUpdate,
	runType: 'infinity',
	async execute(client, channel) {
		try {
			const settings = await client.getGuild(channel.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = channel.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			const candidates = [];
			const createLog = await getAuditLogs(channel.guild, AuditLogEvent.WebhookCreate);
			if (createLog?.createdTimestamp && Date.now() - createLog.createdTimestamp <= 10000) {
				candidates.push({ label: 'Webhook Created', entry: createLog });
			}

			const updateLog = await getAuditLogs(channel.guild, AuditLogEvent.WebhookUpdate);
			if (updateLog?.createdTimestamp && Date.now() - updateLog.createdTimestamp <= 10000) {
				candidates.push({ label: 'Webhook Updated', entry: updateLog });
			}

			const deleteLog = await getAuditLogs(channel.guild, AuditLogEvent.WebhookDelete);
			if (deleteLog?.createdTimestamp && Date.now() - deleteLog.createdTimestamp <= 10000) {
				candidates.push({ label: 'Webhook Deleted', entry: deleteLog });
			}

			candidates.sort((a, b) => (b.entry.createdTimestamp || 0) - (a.entry.createdTimestamp || 0));
			const latest = candidates[0] || null;

			const embed = new EmbedBuilder()
				.setTitle(latest?.label || 'Webhooks Updated')
				.setColor(client.colors.warning)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Channel ID: ${channel.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Channel', value: channel.url || `#${channel.name}`, inline: false },
					{ name: 'Updated By', value: latest?.entry?.executor ? `<@${latest.entry.executor.id}>` : 'Unknown', inline: false },
					{ name: 'Reason', value: latest?.entry?.reason || 'No reason provided', inline: false },
					{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: false }
				);

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send webhooks update modlog:', err);
			}
		} catch (err) {
			console.error('Error in webhooksUpdate event:', err);
		}
	},
};
