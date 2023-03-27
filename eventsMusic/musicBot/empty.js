const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'empty',
	runType: 'on',
	async execute(channel, client) {
		const settings = await client.getGuild(channel.guild);

		const attachment = new AttachmentBuilder(`${join(__dirname, '../../images/vi/Goodbye.gif')}`, { name: 'Goodbye.gif' });
		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('**Channel Empty**')
			.setDescription(`Voice channel is empty. Goodbye!`)
			.setThumbnail('attachment://Goodbye.gif');

		channel.send({ embeds: [embed], files: [attachment] }).then((m) => {
			setTimeout(() => m.delete(), 120 * 1000);
		});
	},
};
