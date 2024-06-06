const { Events, ChannelType } = require('discord.js');
const { autoChannelData } = require('../../models');

module.exports = {
	name: Events.ChannelDelete,
	runType: 'infinity',
	async execute(client, channel) {
		// Check if the channel is a voice channel
		if (channel.type !== ChannelType.GuildVoice) return;

		// Check if the channel is a masterChannel
		const findMasterData = await autoChannelData.findOne({ guildId: channel.guild.id, 'masterChannels.masterChannelId': channel.id });
		if (findMasterData) {
			// find the correct masterChannel based on the channel id
			const childChannels = findMasterData.masterChannels.map((channel) => channel.childChannels);

			// Fetch each child channel and delete it
			await childChannels[0].forEach(async (childChannel) => {
				if (childChannel) {
					try {
						await channel.guild.channels.cache.get(childChannel.childId).delete();
					} catch (error) {}
				}
			});

			// Delete the master channel
			await autoChannelData.findOneAndUpdate({ guildId: channel.guild.id }, { $pull: { masterChannels: { masterChannelId: channel.id } } });
		} else {
			// Check if the channel is a childChannel
			const findChildData = await autoChannelData.findOne({ guildId: channel.guild.id, 'masterChannels.childChannels.childId': channel.id });
			if (findChildData) {
				// Get the correct masterChannel based on the childChannel id
				const data = findChildData.masterChannels.find((channel) => channel.childChannels.childId === channel.id);
				if (!data) return;

				// Delete the childChannel from the database
				await autoChannelData.findOneAndUpdate(
					{ guildId: channel.guild.id, 'masterChannels.childChannels.childId': channel.id },
					{ $pull: { 'masterChannels.$[].childChannels': { childId: channel.id } } }
				);
			}
		}
	},
};
