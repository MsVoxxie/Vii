const { Events, hyperlink } = require('discord.js');
const { embedHasContent } = require('../../functions/helpers/utils');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Checks
		if (message.author.bot) return;
		if (!message.content.startsWith('https://www.pixiv.net/')) return;

		// Check if we should fix or not.
		const settings = await client.getGuild(message.guild);
		if (!settings.shouldFixLinks) return;

		//Create new URL
		const fixedURL = new URL(message);
		fixedURL.hostname = 'phixiv.net';

		// Check if the embed has content
		const { hasImage, hasThumbnail, hasDescription } = embedHasContent(message.embeds[0]);
		if (hasImage || hasThumbnail || hasDescription) {
			//! Manually Fix
			await message.react('🔧');
			// Add a reaction collector to listen for the fix reaction
			const filter = (reaction, user) => reaction.emoji.name === '🔧' && user.id === message.author.id;
			const collector = message.createReactionCollector({ filter, time: 60 * 1000 });

			collector.on('collect', async () => {
				await collector.stop();
				await message.reactions.removeAll();

				// Format the url to be pretty
				const autoFix = hyperlink(`UserFixed • Pixiv`, fixedURL.href);
				await message.reply({ content: autoFix, allowedMentions: { repliedUser: false } });
			});

			collector.on('end', async () => {
				await message.reactions.removeAll();
			});
			return;
		}

		// Format the url to be pretty
		const autoFix = hyperlink(`AutoFixed • Pixiv`, fixedURL.href);
		await message.reply({ content: autoFix, allowedMentions: { repliedUser: false } });
	},
};
