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
			// Check if the joined channel is a master channel
			const findData = await autoChannelData.findOne({ guildId: newState.guild.id, 'masterChannels.masterChannelId': newState.channelId });
			if (!findData) return;
			
			// Get the specific masterChannel data that matches the joined channel
			const data = findData.masterChannels.find((mc) => mc.masterChannelId === newState.channelId);
			if (!data) return;

			// Get the creator channel
			const creatorChannel = newState.guild.channels.cache.get(data.masterChannelId);
			if (!creatorChannel) return;

			// User joined a master channel, create child
			if (newState.channelId === creatorChannel.id) {
				// Use the number of existing child channels + 1 for the next channel number
				const currentNum = data.childChannels.length + 1;
				
				// Create the channel with template replacements
				let channelName = data.childDefaultName
					.replace('{USER}', newState.member.displayName)
					.replace('{NUM}', currentNum.toString());
				
				const createdChannel = await newState.guild.channels.create({
					name: channelName,
					type: ChannelType.GuildVoice,
					parent: creatorChannel.parent,
					userLimit: data.childDefaultMaxUsers,
				});

				// Position child directly below the master
				await createdChannel.setPosition(creatorChannel.position + 1 + data.childChannels.length);

				// Dont audit the channel creation
				createdChannel.shouldAudit = false;

				// Send basic information about owner commands to the channel.
				await createdChannel.send({ content: `Welcome **${newState.member.displayName}**\n You can manage your channel with the /**voice** commands.` });

				// Update database with new child channel
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
