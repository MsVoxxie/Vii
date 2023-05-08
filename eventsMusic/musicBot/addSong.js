const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'addSong',
	runType: 'on',
	async execute(queue, song, client) {
		const settings = await client.getGuild(queue.textChannel.guild);

		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('**Media added to Queue**')
			.setThumbnail(song.thumbnail)
			.setDescription(`**Queued»** [${song.name}](${song.url})\n**Duration»** \`${song.formattedDuration}\`\n**Added By»** ${song.user}`);

		queue.textChannel.send({ embeds: [embed] }).then((m) => {
			setTimeout(() => m.delete(), 120 * 1000);
		}).catch((error) => {
			console.log('Unable to clean up message.');
		});
	},
};
