const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');
const { youtubeNotificationData } = require('../../models/index');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('youtube-watch-add')
		.setDescription('Add a Youtube channel to my watch list.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addStringOption((option) => option.setName('youtube-id').setDescription('The ID of the Youtube channel.').setRequired(true))
		.addChannelOption((option) =>
			option
				.setName('target-channel')
				.setDescription('The channel to send notifications to.')
				.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('custom-message').setDescription('Template: {VIDEO_TITLE) {VIDEO_URL} {CHANNEL_NAME} {CHANNEL_URL}')
		),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Declarations
		const targetYtChannelId = interaction.options.getString('youtube-id');
		const targetNotificationChannel = interaction.options.getChannel('target-channel');
		const targetCustomMessage = interaction.options.getString('custom-message');
		const YOUTUBE_RSS_URL = `https://youtube.com/feeds/videos.xml?channel_id=${targetYtChannelId}`;

		// Check for duplicates
		const duplicateExists = await youtubeNotificationData.exists({
			channelId: targetNotificationChannel.id,
			ytChannelId: targetYtChannelId,
		});
		if (duplicateExists) return interaction.followUp('This channel is already being watched.\nPlease run **youtube-watch-remove** first.');

		// Define Feed
		const channelFeed = await parser.parseURL(YOUTUBE_RSS_URL).catch((e) => {
			interaction.followUp(
				'Invalid channel ID.\nTo fetch a channel ID, go to the channels **"About"** Section and scroll down to **"Share Channel"** and then click **"Copy channel ID"**.'
			);
		});
		if (!channelFeed) return;

		// Set Database object
		const channelName = channelFeed.title;

		const databaseObject = new youtubeNotificationData({
			guildId: interaction.guild.id,
			channelId: targetNotificationChannel.id,
			ytChannelId: targetYtChannelId,
			customMessage: targetCustomMessage,
			lastCheckedVideo: null,
		});

		if (channelFeed.items.length) {
			const latestVideo = channelFeed.items[0];
			databaseObject.lastCheckedVideo = {
				id: latestVideo.id.split(':')[2],
				publishDate: latestVideo.pubDate,
			};
		}

		// Save Database object
		await databaseObject
			.save()
			.then(() => {
				const embed = new EmbedBuilder()
					.setColor(client.colors.vii)
					.setTitle('Youtube channel is now being watched.')
					.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
					.setDescription(`${targetNotificationChannel} will now receive new uploads from\n**${channelName}**`);
				interaction.followUp({ embeds: [embed] });
			})
			.catch((e) => {
				interaction.followUp('Unexpected database error. Please try again later.');
			});
	},
};
