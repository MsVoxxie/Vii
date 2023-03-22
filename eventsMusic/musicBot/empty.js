const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'empty',
	runType: 'on',
	async execute(channel, client) {
		const settings = await client.getGuild(channel.guild);

		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('**Channel Empty**')
			.setDescription(`Voice channel is empty. Goodbye!`);

		channel.send({ embeds: [embed] }).then((m) => {
			setTimeout(() => m.delete(), 60 * 1000);
		});
	},
};
