const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffle the current queue.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	async execute(client, interaction, settings) {
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You're not in a voice channel!");
		await interaction.deferReply();

		await client.distube.shuffle(interaction);

		// Build Embed
		const embed = new EmbedBuilder()
			.setTitle(`**Queue Shuffled!**`)
			.setDescription(`${interaction.member} shuffled the queue.`)
			.setColor(settings.guildColorHex);
		return interaction.followUp({ embeds: [embed] });
	},
};
