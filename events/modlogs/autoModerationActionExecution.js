const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.AutoModerationActionExecution,
	runType: 'infinity',
	async execute(client, execution) {
		try {
			const settings = await client.getGuild(execution.guild);
			if (!settings || settings.modLogId === null) return;

			const modLogChannel = execution.guild.channels.cache.get(settings.modLogId);
			if (!modLogChannel) return;

			const embed = new EmbedBuilder()
				.setTitle('Auto Moderation Triggered')
				.setColor(client.colors.warning)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `Rule ID: ${execution.ruleId}` })
				.setTimestamp()
				.addFields(
					{ name: 'User', value: execution.userId ? `<@${execution.userId}>` : 'Unknown', inline: false },
					{ name: 'Rule', value: execution.ruleTriggerType ? `${execution.ruleName || 'Unknown'} (${execution.ruleTriggerType})` : (execution.ruleName || 'Unknown'), inline: false },
					{ name: 'Action Type', value: `${execution.action?.type || 'Unknown'}`, inline: false },
					{ name: 'Channel', value: execution.channelId ? `<#${execution.channelId}>` : 'Unknown', inline: false },
					{ name: 'Triggered', value: client.relTimestamp(Date.now()), inline: false }
				);

			if (execution.matchedKeyword) {
				embed.addFields({ name: 'Matched Keyword', value: execution.matchedKeyword, inline: false });
			}

			if (execution.matchedContent) {
				embed.addFields({ name: 'Matched Content', value: execution.matchedContent.slice(0, 1024), inline: false });
			}

			if (execution.content) {
				embed.addFields({ name: 'Message Content', value: execution.content.slice(0, 1024), inline: false });
			}

			if (execution.messageId) {
				embed.addFields({ name: 'Message ID', value: execution.messageId, inline: false });
			}

			try {
				await modLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send automod execution modlog:', err);
			}
		} catch (err) {
			console.error('Error in autoModerationActionExecution event:', err);
		}
	},
};