const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.MessageReactionAdd,
	runType: 'disabled',
	async execute(client, reaction, user) {
		// If user is a bot, return.
		if (user.bot) return;

		// Temporary Failsafe
		if (user.id !== '101789503634554880') return;

		// Fetch Partials
		if (reaction.message.partial) await reaction.message.fetch();

		//Definitions
		const message = await reaction.message;
		const settings = await client.getGuild(message.guild);
		const starChannel = await message.guild.channels.cache.get(settings.starboardChannelId);
		if (!starChannel) return console.log('No starboard, giving up.');
		const starLimit = settings.starboardLimit;
		const starEmoji = settings.starboardEmoji;
		if (reaction.emoji.name !== starEmoji) return;
		const starringUser = await message.guild.members.cache.get(user.id);

		// Arrays
		const replyEmbeds = [];
		const messageEmbeds = [];

		//? TODO: Figure out a way to loop over attachments for embeds without ignoring zero attachment messages.
	},
};
