const { Events, ChannelType } = require('discord.js');
const { autoChannelData } = require('../../models');

module.exports = {
	name: Events.VoiceStateUpdate,
	runType: 'infinity',
	async execute(client, oldState, newState) {
		// Joined Voice Channel
		if (
			(!oldState.channelId && newState.channel.id && !oldState.channel && newState.channel) ||
			(oldState.channelId && newState.channelId && oldState.channel && newState.channel)
		) {
			// Get the auto channel data
			const findData = await autoChannelData.findOne({ guildId: newState.guild.id, 'masterChannels.masterCategoryId': newState.channel.parent.id });
			if (!findData) return;
			// Get the correct masterChannel based on the parent id
			const data = findData.masterChannels.find((channel) => channel.masterCategoryId === newState.channel.parent.id);
			if (!data) return;

			// Get the creator channel
			const creatorChannel = newState.guild.channels.cache.get(data.masterChannelId);
			if (!creatorChannel) return;

			// Check if the user is in the creator channel
			if (newState.channelId === creatorChannel.id) {
				// Create the channel
				const createdChannel = await newState.guild.channels.create({
					name: data.childDefaultName.replace('{USER}', newState.member.displayName),
					type: ChannelType.GuildVoice,
					parent: creatorChannel.parent,
					userLimit: data.childDefaultMaxUsers,
					position: creatorChannel.position + 0,
				});

				// Dont audit the channel creation
				createdChannel.shouldAudit = false;

				// Send basic information about owner commands to the channel.
				await createdChannel.send({ content: `Welcome **${newState.member.displayName}**\n You can manage your channel with the /**voice** commands.` });

				await autoChannelData.findOneAndUpdate(
					{ guildId: newState.guild.id, 'masterChannels.masterChannelId': newState.channelId },
					{
						$addToSet: {
							'masterChannels.$.childChannels': {
								childId: createdChannel.id,
								createdBy: newState.member.id,
							},
						},
					},
					{ new: true, upsert: true }
				);
				// Move the user
				await newState.member.voice.setChannel(createdChannel);
			}
		}

		//Left Voice Channel
		if (
			(oldState.channelId && !newState.channelId && oldState.channel && !newState.channel) ||
			(oldState.channelId && newState.channelId && oldState.channel && newState.channel)
		) {
			// Check if the user left a child channel
			const childDataFetch = await autoChannelData.findOne(
				{ guildId: oldState.guild.id, 'masterChannels.childChannels.childId': oldState.channelId },
				{ 'masterChannels.childChannels.$': 1 }
			);
			if (!childDataFetch) return;
			// Get the correct childChannel based on the child id
			const childData = childDataFetch.masterChannels[0].childChannels.find((channel) => channel.childId === oldState.channelId);
			//const childData = childDataFetch.masterChannels[0].childChannels[0];
			if (!childData) return;

			// Check if the oldChannel was a child channel
			if (oldState.channelId === childData.childId) {
				if (oldState.channel?.members.size === 0) {
					const childChannel = oldState.guild.channels.cache.get(oldState.channelId);
					await childChannel.delete();

					// Remove the channel from the children array
					await autoChannelData.findOneAndUpdate(
						{ guildId: oldState.guild.id, 'masterChannels.childChannels.childId': oldState.channelId },
						{ $pull: { 'masterChannels.$[].childChannels': { childId: oldState.channelId } } },
						{ new: true }
					);
				}
			}
		}
	},
};
