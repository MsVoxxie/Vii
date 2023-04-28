const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('animal')
		.setDescription('Random Animal Pictures!')
		.addStringOption((opt) =>
			opt
				.setName('choice')
				.setDescription('Which animal to retrieve')
				.addChoices(
					{ name: 'Bird', value: 'bird' },
					{ name: 'Cat', value: 'cat' },
					{ name: 'Dog', value: 'dog' },
					{ name: 'Red Panda', value: 'red_panda' },
					{ name: 'Fox', value: 'fox' },
					{ name: 'Kangaroo', value: 'kangaroo' },
					{ name: 'Koala', value: 'koala' },
					{ name: 'Panda', value: 'panda' },
					{ name: 'Raccoon', value: 'raccoon' }
				)
				.setRequired(true)
		)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		const animalSelection = interaction.options.getString('choice');
		const animalEndpoint = `https://some-random-api.ml/animal/${animalSelection}`;

		// Defer, Things take time.
		await interaction.deferReply();

		// Fetch Animal
		const Animal = await fetch(animalEndpoint).then((res) => res.json());

		// Build Embed
		const embed = new EmbedBuilder()
			.setTitle(`**Random ${animalSelection} Picture!**`)
			.setImage(Animal.image)
			.setColor(settings.guildColorHex)
			.setTimestamp();

		// Send it
		return await interaction.followUp({ embeds: [embed] });
	},
};
