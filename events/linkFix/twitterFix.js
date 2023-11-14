const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Checks
		if (message.author.bot) return;
		if (!message.content.startsWith('https://twitter.com/')) return;

		//Create new URL
		const fixedURL = new URL(message);
		fixedURL.hostname = 'vxtwitter.com';

		// Send Fix
		await message.reply({ content: fixedURL.href, allowedMentions: { repliedUser: false } });
	},
};