const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { youtubeNotificationData } = require('../../models/index');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('youtube-watch-remove')
		.setDescription('Remove a Youtube channel from my watch list.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addStringOption((option) => option.setName('youtube-id').setDescription('The ID of the Youtube channel.').setRequired(true))
		.addChannelOption((option) =>
			option
				.setName('target-channel')
				.setDescription('The channel to remove notifications from.')
				.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
				.setRequired(true)
		),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply({ ephemeral: true });

		// Declarations
		const targetYtChannelId = interaction.options.getString('youtube-id');
		const targetNotificationChannel = interaction.options.getChannel('target-channel');

		// Check if the channel exists in the database.
		const targetChannel = await youtubeNotificationData.findOne({
			ytChannelId: targetYtChannelId,
			channelId: targetNotificationChannel.id,
		});
		if (!targetChannel) return interaction.followUp('This channel is not currently being watched.');

		// Remove the entry from the database.
		youtubeNotificationData
			.findOneAndDelete({
				_id: targetChannel._id,
			})
			.then(() => {
				interaction.followUp('Channel has been removed from my watch list!');
			})
			.catch((e) => {
				interaction.followUp('There was a database error, Please try again later.');
			});
	},
};
