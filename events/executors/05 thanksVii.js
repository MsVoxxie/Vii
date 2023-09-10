const { Events } = require('discord.js');
const { ViiEmojis } = require('../../images/icons/emojis');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		//People were nice to me, show them a nice emoji.
		const emojis = [ViiEmojis['VIIAWE'], ViiEmojis['VIIHAPPY']];
		const randEmoji = emojis[Math.floor(Math.random() * emojis.length)];
		const tyRegex = /((thank you|thank?s|) vii)/;

		if (tyRegex.test(message.content.toLowerCase())) {
			await message.react(randEmoji);
		}
	},
};
