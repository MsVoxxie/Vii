const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

module.exports = {
	name: Events.ThreadUpdate,
	runType: 'infinity',
	async execute(client, oldThread, newThread) {
		try {
			if (oldThread.shouldAudit === false || newThread.shouldAudit === false) return;
			if (oldThread.rawPosition !== newThread.rawPosition) return;

			const settings = await client.getGuild(oldThread.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = oldThread.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			let auditLog = await getAuditLogs(oldThread.guild, AuditLogEvent.ChannelUpdate);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 10000 || `${auditLog?.target?.id || ''}` !== newThread.id) {
				executor = null;
			}

			const embed = new EmbedBuilder()
				.setTitle('Thread Updated')
				.setColor(client.colors.warning)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Thread ID: ${newThread.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Thread', value: `<#${newThread.id}>`, inline: false },
					{ name: 'Updated By', value: executor ? `<@${executor.id}>` : 'Unknown', inline: false }
				);

			let changed = false;

			if (oldThread.name !== newThread.name) {
				changed = true;
				embed.addFields({ name: 'Name', value: `${oldThread.name} **›** ${newThread.name}`, inline: false });
			}

			if (oldThread.archived !== newThread.archived) {
				changed = true;
				embed.addFields({ name: 'Archived', value: `${oldThread.archived ? 'Yes' : 'No'} **›** ${newThread.archived ? 'Yes' : 'No'}`, inline: false });
			}

			if (oldThread.locked !== newThread.locked) {
				changed = true;
				embed.addFields({ name: 'Locked', value: `${oldThread.locked ? 'Yes' : 'No'} **›** ${newThread.locked ? 'Yes' : 'No'}`, inline: false });
			}

			if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
				changed = true;
				embed.addFields({
					name: 'Auto Archive',
					value: `${oldThread.autoArchiveDuration || 'Unknown'} min **›** ${newThread.autoArchiveDuration || 'Unknown'} min`,
					inline: false,
				});
			}

			if (!changed) return;

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send thread update modlog:', err);
			}
		} catch (err) {
			console.error('Error in threadUpdate event:', err);
		}
	},
};
