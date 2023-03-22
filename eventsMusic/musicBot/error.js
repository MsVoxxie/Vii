const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'error',
	runType: 'on',
	async execute(channel, e, client) {
		const settings = await client.getGuild(channel.guild);
		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('**An error was encountered.**')
			.setDescription(`Sorry about that!`);
		if (channel) {
			channel.send({ embeds: [embed] }).then((m) => {
				setTimeout(() => m.delete(), 60 * 1000);
			});
		} else {
			console.error(e);
		}
	},
};
