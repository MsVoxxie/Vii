const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Options
		const animalSelection = interaction.options.getString('choice');
		const animalEndpoint = `https://some-random-api.com/animal/${animalSelection}`;

		// Fetch Animal
		const Animal = await fetch(animalEndpoint).then((res) => res.json());

		// Build Embed
		const embed = new EmbedBuilder().setTitle(`**Random ${animalSelection} Picture!**`).setImage(Animal.image).setColor(client.colors.vii).setTimestamp();

		// Send it
		return await interaction.followUp({ embeds: [embed] });
	},
};
