const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user, or your own avatar.')
		.addUserOption((option) => option.setName('target').setDescription("The user's avatar to show"))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		const user = interaction.options.getUser('target') || interaction.user;

		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setAuthor({ name: `${user.username}'s Avatar`, iconURL: user.displayAvatarURL({ dynamic: true }) })
			.setImage(user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }));

		return interaction.reply({ embeds: [embed] });
	},
};
