const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.ThreadDelete,
	runType: 'infinity',
	async execute(client, thread) {
		try {
			if (thread.shouldAudit === false) return;

			const settings = await client.getGuild(thread.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = thread.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(thread.guild, AuditLogEvent.ChannelDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000 || `${auditLog?.target?.id || ''}` !== thread.id) {
				executor = null;
			}

			const embed = new EmbedBuilder()
				.setTitle('Thread Deleted')
				.setColor(client.colors.error)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Thread ID: ${thread.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Thread Name', value: thread.name || 'Unknown', inline: false },
					{ name: 'Parent Channel', value: thread.parent ? `<#${thread.parent.id}>` : 'Unknown', inline: false },
					{ name: 'Deleted By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: false }
				);

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send thread delete modlog:', err);
			}
		} catch (err) {
			console.error('Error in threadDelete event:', err);
		}
	},
};
