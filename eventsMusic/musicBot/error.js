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
		if (channel) channel.send({ embeds: [embed] });
		else console.error(e);
	},
};
