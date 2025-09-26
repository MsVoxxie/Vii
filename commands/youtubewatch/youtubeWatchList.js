const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const { youtubeNotificationData } = require('../../models/index');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('youtube-watch-list')
		.setDescription('List currently watched channels.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Get all of this guilds watched channels
		const watchedChannels = await youtubeNotificationData.find({ guildId: interaction.guildId });
		const formattedArray = [];

		for (const channel of watchedChannels) {
			const YOUTUBE_RSS_URL = `https://youtube.com/feeds/videos.xml?channel_id=${channel.ytChannelId}`;
			const channelFeed = await parser.parseURL(YOUTUBE_RSS_URL);
			if (!channelFeed?.items.length) continue;

			// Get channel name and Id
			const channelName = channelFeed.title;
			const channelId = channel.ytChannelId;

			formattedArray.push(`**${channelName}** **|** \`${channelId}\` **|** <#${channel.channelId}>`);
		}

		// Create Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Currently watched channels')
			.setDescription(formattedArray.map((ch) => ch).join('\n'));

		interaction.followUp({ embeds: [embed] });
	},
};
