const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { join } = require('path');

module.exports = {
	name: 'finish',
	runType: 'on',
	async execute(queue, client) {
		const settings = await client.getGuild(queue.textChannel.guild);
		if (queue.lastPlaying) {
			try {
				await queue.lastPlaying.delete(); // Delete last playing if there is one, reduces spam.
			} catch (error) {
				console.log('Error deleting last playing message');
			}
		}

		const attachment = new AttachmentBuilder(`${join(__dirname, '../../images/vi/Goodbye.gif')}`, { name: 'Goodbye.gif' });
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('**Queue Empty**')
			.setDescription(`Queue is empty. Goodbye!`)
			.setThumbnail('attachment://Goodbye.gif');

		await queue.textChannel.send({ embeds: [embed], files: [attachment] }).then((m) => {
			setTimeout(() => m.delete(), 120 * 1000);
		}).catch((error) => {
			console.log('Unable to clean up message.');
		});
	},
};
