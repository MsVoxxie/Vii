const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Checks
		if (message.author.bot) return;
		if (!message.content.startsWith('https://www.instagram.com/')) return;

		// Check if we should fix or not.
		const settings = await client.getGuild(message.guild);
		if (!settings.shouldFixLinks) return;

		//Create new URL
		const fixedURL = new URL(message);
		fixedURL.hostname = 'www.ddinstagram.com';

		// Send Fix
		await message.reply({ content: fixedURL.href, allowedMentions: { repliedUser: false } });
	},
};
