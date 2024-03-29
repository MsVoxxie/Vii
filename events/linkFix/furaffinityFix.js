const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'disabled',
	async execute(client, message) {
		// Checks
		if (message.author.bot) return;
		if (!message.content.startsWith('https://www.furaffinity.net/')) return;

		// Check if we should fix or not.
		const settings = await client.getGuild(message.guild);
		if (!settings.shouldFixLinks) return;

		//Create new URL
		const fixedURL = new URL(message);
		fixedURL.hostname = 'xfuraffinity.net';

		// Send Fix
		await message.reply({ content: fixedURL.href, allowedMentions: { repliedUser: false } });
	},
};
