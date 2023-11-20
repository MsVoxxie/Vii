const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatEmojiBar } = require('../../functions/helpers/emojiProgressBar');

module.exports = {
	data: new SlashCommandBuilder().setName('devtest').setDescription('Who knows what it does at this moment in time'),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		let data1 = ['|'];
		let data2 = ['|', '|', '|', '|', '|', '|', '|', '|'];

		const embed = new EmbedBuilder().setDescription(formatEmojiBar(data1, data2));

		interaction.reply({ embeds: [embed] });
	},
};
