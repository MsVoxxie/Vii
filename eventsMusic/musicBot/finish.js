const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'finish',
	runType: 'on',
	async execute(queue, client) {
		const settings = await client.getGuild(queue.textChannel.guild);
		if (queue.lastPlaying) await queue.lastPlaying.delete(); // Delete last playing if there is one, reduces spam.

		const embed = new EmbedBuilder().setColor(settings.guildColorHex).setTitle('**Queue Empty**').setDescription(`Queue is empty. Goodbye!`);

		queue.textChannel.send({ embeds: [embed] });
	},
};
