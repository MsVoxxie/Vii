const { userData } = require('../../models/index');
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.VoiceStateUpdate,
	runType: 'infinity',
	async execute(client, oldState, newState) {
		// Check if we should audit
		if (oldState.shouldAudit === false || newState.shouldAudit === false) return;

		// Declarations
		const userId = oldState.id || newState.id;
		const guildId = oldState.guild.id || newState.guild.id;
		const curGuild = client.guilds.cache.get(guildId);
		const member = await curGuild.members.cache.get(userId);
		if (member && member.bot) return;

		const settings = await client.getGuild(curGuild);
		if (settings.auditLogId === null) return;
		const auditLogChannel = await curGuild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Setup Channel Strings
		if (oldState && oldState.channel && oldState.channel.parent && oldState.channel.parent.name) oldParentName = oldState.channel.parent.name;
		if (oldState && oldState.channel && oldState.channel.name) oldChannelName = oldState.channel.name;
		if (oldState && oldState.channelId) oldChannelId = oldState.channelId;

		if (newState && newState.channel && newState.channel.parent && newState.channel.parent.name) newParentName = newState.channel.parent.name;
		if (newState && newState.channel && newState.channel.name) newChannelName = newState.channel.name;
		if (newState && newState.channelId) newChannelId = newState.channelId;

		// Joined Voice Channel
		if (!oldState.channelId && newState.channel.id && !oldState.channel && newState.channel) {
			// Database Entry
			await userData.findOneAndUpdate({ guildId: guildId, userId: userId }, { $set: { voiceState: { joinDate: Date.now() } } }, { upsert: true, new: true });

			// Build Embed
			const embed = new EmbedBuilder()
				.setTitle('User Joined Voice Channel')
				.setColor(client.colors.vii)
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Joined Channel', value: newState.channel.url, inline: false },
					{ name: 'User Joined', value: `<@${member.id}>`, inline: false },
					{ name: 'Connected', value: client.relTimestamp(Date.now()), inline: false }
				);

			// Send it
			await auditLogChannel.send({ embeds: [embed] });
		}

		//Left Voice Channel
		if (oldState.channelId && !newState.channelId && oldState.channel && !newState.channel) {
			// Old Date
			const oldData = await userData.findOne({ guildId: guildId, userId: userId }).lean();
			const oldVoice = oldData.voiceState;

			// Database Entry
			const newData = await userData.findOneAndUpdate(
				{ guildId: guildId, userId: userId },
				{ $set: { voiceState: { joinDate: oldVoice.joinDate, leaveDate: Date.now() } } },
				{ upsert: true, new: true }
			);

			// Build Embed
			const embed = new EmbedBuilder()
				.setTitle('User Left Voice Channel')
				.setColor(client.colors.vii)
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Left Channel', value: oldState.channel.url, inline: false },
					{ name: 'User Joined', value: `<@${member.id}>`, inline: false },
					{ name: 'Disconnected', value: client.relTimestamp(Date.now()), inline: false },
					{
						name: 'Connection Duration',
						value: `\`${client.getDuration(newData.voiceState.joinDate, newData.voiceState.leaveDate).join(' ')}\``,
						inline: false,
					}
				);

			// Send it
			await auditLogChannel.send({ embeds: [embed] });
		}

		//Switched Voice Channel
		if (oldState.channelId && newState.channelId && oldState.channel && newState.channel) {
			// False positive check
			if (oldState.channelId === newState.channelId) return;

			// Old Date
			const oldData = await userData.findOne({ guildId: guildId, userId: userId }).lean();
			const oldVoice = oldData.voiceState;

			// Database Entry
			await userData.findOneAndUpdate(
				{ guildId: guildId, userId: userId },
				{ $set: { voiceState: { joinDate: Date.now(), leaveDate: Date.now() } } },
				{ upsert: true, new: true }
			);

			// Build Embed
			const embed = new EmbedBuilder()
				.setTitle('User Switched Voice Channels')
				.setColor(client.colors.vii)
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Left Channel', value: oldState.channel.url, inline: false },
					{ name: 'Joined Channel', value: newState.channel.url, inline: false },
					{ name: 'User Joined', value: `<@${member.id}>`, inline: false },
					{ name: 'Switched', value: client.relTimestamp(Date.now()), inline: false },
					{
						name: 'Connection Duration',
						value: `\`${client.getDuration(oldVoice.joinDate, Date.now()).join(' ')}\``,
						inline: false,
					}
				);

			// Send it
			await auditLogChannel.send({ embeds: [embed] });
		}
	},
};
