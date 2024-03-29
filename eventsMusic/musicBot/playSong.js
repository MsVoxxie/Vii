const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink } = require('discord.js');

module.exports = {
	name: 'playSong',
	runType: 'on',
	async execute(queue, song, client) {
		const settings = await client.getGuild(queue.textChannel.guild);
		if (queue.lastPlaying) {
			try {
				await queue.lastPlaying.delete(); // Delete last playing if there is one, reduces spam.
			} catch (error) {
				console.log('Error deleting last playing message');
			}
		}

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
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
							setTimeout(() => m.delete(), 120 * 1000);
						}).catch((error) => {
							console.log('Unable to clean up message.');
						});
					} else {
						await int.deferUpdate();
						client.distube.resume(int.guild);
						await queue.textChannel.send(`${int.member} resumed the current media.`).then((m) => {
							setTimeout(() => m.delete(), 120 * 1000);
						}).catch((error) => {
							console.log('Unable to clean up message.');
						});
					}
					break;

				case 'SKIP':
					if (!queue) return await int.deferUpdate();
					if (queue.songs.length === 1) return queue.textChannel.send('There is only one song in the queue!');
					client.distube.skip(int.guild);
					await queue.textChannel.send(`${int.member} skipped the current media.`).then((m) => {
						setTimeout(() => m.delete(), 120 * 1000);
					}).catch((error) => {
						console.log('Unable to clean up message.');
					});
					break;

				case 'STOP':
					if (!queue) return await int.deferUpdate();
					client.distube.stop(int.guild);
					await playing.delete();
					await queue.textChannel.send(`${int.member} stopped the current media.`).then((m) => {
						setTimeout(() => m.delete(), 120 * 1000);
					}).catch((error) => {
						console.log('Unable to clean up message.');
					});
					break;
			}
		});
	},
};
