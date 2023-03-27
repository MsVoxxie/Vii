const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { join } = require('path');

module.exports = {
	name: 'finish',
	runType: 'on',
	async execute(queue, client) {
		const settings = await client.getGuild(queue.textChannel.guild);
		if (queue.lastPlaying) await queue.lastPlaying.delete(); // Delete last playing if there is one, reduces spam.

		const attachment = new AttachmentBuilder(`${join(__dirname, '../../images/vi/Goodbye.gif')}`, { name: 'Goodbye.gif' });
		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('**Queue Empty**')
			.setDescription(`Queue is empty. Goodbye!`)
			.setThumbnail('attachment://Goodbye.gif');

		queue.textChannel.send({ embeds: [embed], files: [attachment] }).then((m) => {
			setTimeout(() => m.delete(), 120 * 1000);
		});
	},
};
