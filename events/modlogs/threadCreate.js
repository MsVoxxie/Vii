const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.ThreadCreate,
	runType: 'infinity',
	async execute(client, thread) {
		try {
			if (thread.shouldAudit === false) return;

			const settings = await client.getGuild(thread.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = thread.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(thread.guild, AuditLogEvent.ChannelCreate);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000 || `${auditLog?.target?.id || ''}` !== thread.id) {
				executor = null;
			}

			const embed = new EmbedBuilder()
				.setTitle('Thread Created')
				.setColor(client.colors.success)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Thread ID: ${thread.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Thread', value: `<#${thread.id}>`, inline: false },
					{ name: 'Parent Channel', value: thread.parent ? `<#${thread.parent.id}>` : 'Unknown', inline: false },
					{ name: 'Created By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false },
					{ name: 'Auto Archive', value: `${thread.autoArchiveDuration || 'Unknown'} minutes`, inline: false },
					{ name: 'Created', value: client.relTimestamp(Date.now()), inline: false }
				);

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send thread create modlog:', err);
			}
		} catch (err) {
			console.error('Error in threadCreate event:', err);
		}
	},
};
