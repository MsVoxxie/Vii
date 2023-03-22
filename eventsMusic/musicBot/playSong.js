const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'playSong',
	runType: 'on',
	async execute(queue, song, client) {
		const settings = await client.getGuild(queue.textChannel.guild);
		if (queue.lastPlaying) await queue.lastPlaying.delete(); // Delete last playing if there is one, reduces spam.

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(settings.guildColorHex)
			.setTitle('**Now Playing**')
			.setThumbnail(song.thumbnail)
			.setDescription(`**Playing»** [${song.name}](${song.url})\n**Duration»** \`${song.formattedDuration}\`\n**Requested By»** ${song.user}`);

		// Build Buttons
		const Buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setLabel('Play / Pause').setStyle(ButtonStyle.Success).setCustomId('PP'),
			new ButtonBuilder().setLabel('Skip').setStyle(ButtonStyle.Danger).setCustomId('SKIP'),
			new ButtonBuilder().setLabel('Stop').setStyle(ButtonStyle.Danger).setCustomId('STOP')
		);

		// Send playing embed
		const playing = await queue.textChannel.send({ embeds: [embed], components: [Buttons] });
		queue.lastPlaying = playing;

		// Setup collector
		const filter = (interaction) => interaction.member.voice.channelId === interaction.guild.members.me.voice.channelId;
		const collector = await playing.createMessageComponentCollector({ filter, time: song.duration * 1200 });
		collector.on('collect', async (int) => {
			switch (int.customId) {
				case 'PP':
					if (!queue) return await int.deferUpdate();
					if (!queue.paused) {
						await int.deferUpdate();
						client.distube.pause(int.guild);
						await queue.textChannel.send(`${int.member} paused the current media.`).then((m) => {
							setTimeout(() => m.delete(), 60 * 1000);
						});
					} else {
						await int.deferUpdate();
						client.distube.resume(int.guild);
						await queue.textChannel.send(`${int.member} resumed the current media.`).then((m) => {
							setTimeout(() => m.delete(), 60 * 1000);
						});
					}
					break;

				case 'SKIP':
					if (!queue) return await int.deferUpdate();
					client.distube.skip(int.guild);
					await queue.textChannel.send(`${int.member} skipped the current media.`).then((m) => {
						setTimeout(() => m.delete(), 60 * 1000);
					});
					break;

				case 'STOP':
					if (!queue) return await int.deferUpdate();
					client.distube.stop(int.guild);
					await playing.delete();
					await queue.textChannel.send(`${int.member} stopped the current media.`).then((m) => {
						setTimeout(() => m.delete(), 60 * 1000);
					});
					break;
			}
		});
	},
};
