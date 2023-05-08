const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'error',
	runType: 'on',
	async execute(channel, e, client) {
		const settings = await client.getGuild(channel.guild);
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('**An error was encountered.**')
			.setDescription(`Sorry about that!`);
		if (channel) {
			channel.send({ embeds: [embed] }).then((m) => {
				setTimeout(() => m.delete(), 120 * 1000);
			}).catch((error) => {
				console.log('Unable to clean up message.');
			});
		} else {
			console.error(e);
		}
	},
};
