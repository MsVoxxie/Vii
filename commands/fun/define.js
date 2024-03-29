const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
var wd = require('word-definition');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('define')
		.setDescription('Search the Dictonary for a definition!')
		.addStringOption((option) => option.setName('query').setDescription('What would you like to search for?').setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Get options
		const searchQuery = interaction.options.getString('query').replace(/\s/g, '');

		wd.getDef(searchQuery, 'en', null, function (definition) {
			if (!definition.definition) return interaction.reply(`No Definition found for \`${searchQuery}\``);

			// Build Embeds
			const embed = new EmbedBuilder()
				.setTitle('**Dictionary Search**')
				.setDescription(`**Search Query»** ${definition.word}`)
				.setColor(client.colors.vii)
				.addFields({ name: '**Category»**', value: definition.category }, { name: '**Definition»**', value: definition.definition });

			interaction.followUp({ embeds: [embed] });
		});
	},
};
