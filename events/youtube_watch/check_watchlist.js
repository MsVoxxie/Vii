const { youtubeNotificationData } = require('../../models/index');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
	name: 'everyFiveMinutes',
	runType: 'infinity',
	async execute(client) {
		// Get watchlist
		const youtubeWatchlist = await youtubeNotificationData.find();

		// Process channels with limited concurrency to reduce burst load
		const CONCURRENCY = 5;

		async function processWatchedChannel(watchedChannel) {
			try {
				const YOUTUBE_RSS_URL = `https://youtube.com/feeds/videos.xml?channel_id=${watchedChannel.ytChannelId}`;
				const channelFeed = await parser.parseURL(YOUTUBE_RSS_URL);

				// Reset consecutive 404 count on any successful fetch
				if (watchedChannel.consecutive404s > 0) {
					await youtubeNotificationData.updateOne({ _id: watchedChannel._id }, { $set: { consecutive404s: 0 } }).catch(() => null);
				}

				if (!channelFeed?.items?.length) return;

				const latestVideo = channelFeed.items[0];
				const lastCheckedVideo = watchedChannel.lastCheckedVideo;

				// Determine if a new upload exists
				const latestId = latestVideo.id?.split(':')[2];
				const isNewUpload = !lastCheckedVideo || (latestId && latestId !== lastCheckedVideo.id && new Date(latestVideo.pubDate) > new Date(lastCheckedVideo.publishDate));

				if (!isNewUpload) return;

				// Fetch the guild we're targeting
				const targetGuild = client.guilds.cache.get(watchedChannel.guildId) || (await client.guilds.fetch(watchedChannel.guildId).catch(() => null));
				if (!targetGuild) {
					await youtubeNotificationData.findOneAndDelete({ _id: watchedChannel._id }).catch(() => null);
					return;
				}

				// Fetch the channel we're targeting
				const targetChannel = targetGuild.channels.cache.get(watchedChannel.channelId) || (await targetGuild.channels.fetch(watchedChannel.channelId).catch(() => null));
				if (!targetChannel) {
					await youtubeNotificationData.findOneAndDelete({ _id: watchedChannel._id }).catch(() => null);
					return;
				}

				// Update the database with the last video we checked
				watchedChannel.lastCheckedVideo = {
					id: latestId,
					publishDate: latestVideo.pubDate,
				};

				await watchedChannel.save().catch(() => null);

				// Define the customMessage
				const targetMessage =
					watchedChannel.customMessage
						?.replace('{VIDEO_URL}', latestVideo.link)
						?.replace('{VIDEO_TITLE}', latestVideo.title)
						?.replace('{CHANNEL_URL}', channelFeed.link)
						?.replace('{CHANNEL_NAME}', channelFeed.title) || `New upload by **${channelFeed.title}**\n${latestVideo.link}!`;

				await targetChannel.send(targetMessage).catch(() => null);
			} catch (error) {
				// Enhanced logging to identify 404 root cause
				const status = error?.statusCode || error?.status || error?.response?.statusCode || error?.response?.status;
				const url = `https://youtube.com/feeds/videos.xml?channel_id=${watchedChannel?.ytChannelId}`;
				console.warn('YouTube watchlist error:', { ytChannelId: watchedChannel?.ytChannelId, requestUrl: url });

				// If the feed returns 404 repeatedly, remove invalid entries after 3 strikes
				if (status === 404) {
					const current = Number.isFinite(watchedChannel?.consecutive404s) ? watchedChannel.consecutive404s : 0;
					const next = current + 1;
					if (next >= 3) {
						await youtubeNotificationData.findOneAndDelete({ _id: watchedChannel._id }).catch(() => null);
						console.warn('YouTube watchlist removed after 3 consecutive 404s', {
							guildId: watchedChannel?.guildId,
							channelId: watchedChannel?.channelId,
							ytChannelId: watchedChannel?.ytChannelId,
							requestUrl: url,
						});

						return; // stop further processing for this item
					}

					await youtubeNotificationData.updateOne({ _id: watchedChannel._id }, { $set: { consecutive404s: next } }).catch(() => null);
				}
			}
		}

		for (let i = 0; i < youtubeWatchlist.length; i += CONCURRENCY) {
			const batch = youtubeWatchlist.slice(i, i + CONCURRENCY);
			await Promise.allSettled(batch.map((w) => processWatchedChannel(w)));
		}
	},
};
