const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'addSong',
	runType: 'on',
	async execute(queue, song, client) {
		const settings = await client.getGuild(queue.textChannel.guild);

		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('**Media added to Queue**')
            .setThumbnail(song.thumbnail)
			.setDescription(`**Queued»** [${song.name}](${song.url})\n**Duration»** \`${song.formattedDuration}\`\n**Added By»** ${song.user}`);

		queue.textChannel.send({ embeds: [embed] });
	},
};
