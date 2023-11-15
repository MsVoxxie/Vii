const { youtubeNotificationData } = require('../../models/index');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
	name: 'everyFiveMinutes',
	runType: 'infinity',
	async execute(client) {
		// Get watchlist
		const youtubeWatchlist = await youtubeNotificationData.find();

		// Loop watchlist
		for (const watchedChannel of youtubeWatchlist) {
			// Declarations
			const YOUTUBE_RSS_URL = `https://youtube.com/feeds/videos.xml?channel_id=${watchedChannel.ytChannelId}`;
			const channelFeed = await parser.parseURL(YOUTUBE_RSS_URL);
			if (!channelFeed?.items.length) continue;

			const latestVideo = channelFeed.items[0];
			const lastCheckedVideo = watchedChannel.lastCheckedVideo;

			// Check if there has been a new upload
			if (
				!lastCheckedVideo ||
				(latestVideo.id.split(':')[2] !== lastCheckedVideo.id && new Date(latestVideo.pubDate) > new Date(lastCheckedVideo.publishDate))
			) {
				// Fetch the guild we're targeting
				const targetGuild = client.guilds.cache.get(watchedChannel.guildId) || (await client.guilds.fetch(watchedChannel.guildId));
				if (!targetGuild) {
					await youtubeNotificationData.findOneAndDelete({
						_id: watchedChannel._id,
					});
					continue;
				}

				// Fetch the channel we're targeting
				const targetChannel =
					targetGuild.channels.cache.get(watchedChannel.channelId) || (await targetGuild.channels.fetch(watchedChannel.channelId));
				targetChannel.name;
				if (!targetChannel) {
					await youtubeNotificationData.findOneAndDelete({
						_id: watchedChannel._id,
					});
					continue;
				}

				// Update the database with the last video we checked
				watchedChannel.lastCheckedVideo = {
					id: latestVideo.id.split(':')[2],
					publishDate: latestVideo.pubDate,
				};
				watchedChannel
					.save()
					.then(() => {
						// Define the customMessage
						const targetMessage =
							watchedChannel.customMessage
								?.replace('{VIDEO_URL}', latestVideo.link)
								?.replace('{VIDEO_TITLE}', latestVideo.title)
								?.replace('{CHANNEL_URL}', channelFeed.link)
								?.replace('{CHANNEL_NAME}', channelFeed.title) || `New upload by **${channelFeed.title}**\n${latestVideo.link}!`;

						targetChannel.send(targetMessage);
					})
					.catch((e) => null);
			}
		}
	},
};
