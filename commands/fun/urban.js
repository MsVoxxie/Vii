const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Search Urban Dictonary for a definition!')
		.addStringOption((option) => option.setName('query').setDescription('What would you like to search for?').setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		const searchQuery = interaction.options.getString('query');
		const { list } = await fetch(`https://api.urbandictionary.com/v0/define?term=${searchQuery}`)
			.then((response) => response.json())
			.catch((e) => console.error(e));
		if (!list) return interaction.reply(`No results found for \`${searchQuery}\``);
		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

		// Arrays
		const embeds = [];
		let curPage = 0;

		// Build Embeds
		for (result of list) {
			const embed = new EmbedBuilder()
				.setTitle('**Urban Dictionary Search**')
				.setDescription(`**Search Query»** [${searchQuery}](${result.permalink})`)
				.setColor(client.colors.vii)
				.addFields(
					{ name: '**Definition»**', value: trim(result.definition, 1024) },
					{ name: '**Example»**', value: trim(result.example, 1024) },
					{ name: '**Rating»**', value: `👍 ${result.thumbs_up} | 👎 ${result.thumbs_down}` }
				)
				.setTimestamp(Date.now());
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
