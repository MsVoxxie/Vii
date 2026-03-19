const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { formatEmojiBar } = require('../../functions/helpers/emojiProgressBar');
const generateQuote = require('../../functions/helpers/generateQuote');

module.exports = {
	data: new SlashCommandBuilder().setName('devtest').setDescription('Who knows what it does at this moment in time'),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// // Defer, Things take time.
		// await interaction.deferReply();

		// let data1 = ['|'];
		// let data2 = ['|', '|', '|', '|', '|', '|', '|', '|'];

		// const embed = new EmbedBuilder().setDescription(formatEmojiBar(data1, data2));

		// interaction.reply({ embeds: [embed] });

		generateQuote({
			type: 1, // 1 = side-by-side, 2 = full background with quotes
			text: 'them bitches gay',
			authorName: interaction.member.displayName,
			authorHandle: interaction.user.username,
			avatarURL: interaction.user.displayAvatarURL({ extension: 'png', size: 512 }),
			// side: 'right', // only for type 1
		}).then((buffer) => {
			const attachment = new AttachmentBuilder(buffer, { name: 'quote.png' });
			interaction.reply({ files: [attachment] });
		});
	},
};
