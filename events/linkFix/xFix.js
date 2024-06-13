const { Events, hyperlink } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Checks
		if (message.author.bot) return;
		if (!message.content.startsWith('https://x.com/')) return;

		// Definitions
		const twitRegex = /[a-zA-Z0-9_]{0,15}\/status\/(\d+)/s.exec(message.content);
		const twitUser = twitRegex[0].split('/')[0];

		// Check if we should fix or not.
		const settings = await client.getGuild(message.guild);
		if (!settings.shouldFixLinks) return;

		// Check if the embed has content
		const { hasImage, hasThumbnail, hasDescription } = embedHasContent(message.embeds[0]);
		if (hasImage || hasThumbnail || hasDescription) return;

		//Create new URL
		const fixedURL = new URL(message);
		fixedURL.hostname = 'fixupx.com';

		// Format the url to be pretty
		const formmatedURL = hyperlink(`Tweet • ${twitUser}`, fixedURL.href);

		// Send Fix
		await message.reply({ content: formmatedURL, allowedMentions: { repliedUser: false } });
	},
};

function embedHasContent(embed) {
	const image = embed?.image;
	const thumbnail = embed?.thumbnail;
	const description = embed?.description;

	const hasImage = image && image.url;
	const hasThumbnail = thumbnail && thumbnail.url;
	const hasDescription = description && description.length > 0;

	return {
		hasImage,
		hasThumbnail,
		hasDescription,
	};
}
