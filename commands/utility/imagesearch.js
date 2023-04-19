const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
const google = require('googlethis');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('imagesearch')
		.setDescription('Search google for a query to retrieve images.')
		.addStringOption((option) => option.setName('query').setDescription('Query to search images for.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		const searchQuery = interaction.options.getString('query');
		const safeMode = interaction.channel.nsfw ? false : true;
		const initialResults = await google.image(searchQuery, { safe: safeMode });
		const imageResults = initialResults.filter((u) => u.url.replace(/\?.*/g, ''));
		if (!imageResults) return interaction.reply(`No results found for \`${searchQuery}\``);

		// Arrays
		const embeds = [];
		let curPage = 0;

		// Build Embeds
		for (result of imageResults) {
			const resultURL = result.url.replace(/\?.*/g, '');
			if (resultURL.includes(' ')) continue;

			const embed = new EmbedBuilder()
				.setDescription(`**Search Query»** ${searchQuery}\n**Result»** ${result.origin.title}`)
				.setURL(result.origin.website.url)
				.setColor(settings.guildColorHex)
				.setTitle(result.origin.title)
				.setTimestamp(Date.now())
				.setImage(resultURL);
			embeds.push(embed);
		}

		// Build Buttons
		const Buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setLabel('Back').setStyle(ButtonStyle.Success).setCustomId('BACK'),
			new ButtonBuilder().setLabel('Stop').setStyle(ButtonStyle.Danger).setCustomId('STOP'),
			new ButtonBuilder().setLabel('Delete').setStyle(ButtonStyle.Danger).setCustomId('DELETE'),
			new ButtonBuilder().setLabel('Next').setStyle(ButtonStyle.Success).setCustomId('NEXT')
		);

		// Send
		const embedMsg = await interaction.reply({ embeds: [embeds[curPage]], components: [Buttons] });

		// Listen for interactions
		const filter = (interaction) => interaction.user.id === interaction.user.id;
		const collector = await embedMsg.createMessageComponentCollector({ filter, time: 120 * 1000 });
		collector.on('collect', async (int) => {
			// Switch Case Buttons
			switch (int.customId) {
				case 'BACK':
					if (curPage === 0) return await int.deferUpdate();
					curPage--;
					await int.update({ embeds: [embeds[curPage]] });
					break;

				case 'NEXT':
					if (curPage > embeds.length - 1) return await int.deferUpdate();
					curPage++;
					await int.update({ embeds: [embeds[curPage]] });
					break;

				case 'STOP':
					await int.update({ components: [] });
					collector.stop();
					break;

				case 'DELETE': {
					await int.deferUpdate();
					await int.deleteReply();
					collector.stop();
					break;
				}
			}
		});
	},
};
