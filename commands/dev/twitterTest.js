const { SlashCommandBuilder } = require('discord.js');
const { Rettiwt } = require('rettiwt-api');
const rettiwt = new Rettiwt();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twittest')
		.setDescription('Fuck')
		.addStringOption((option) => option.setName('twit').setDescription('twitter url').setRequired(true)),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		await interaction.deferReply();
		const twitURL = interaction.options.getString('twit');
		const twitId = /\/twitter\/status\/(\d+)/s.exec(twitURL)[1];

		console.log(twitId);

		await rettiwt.tweet.details(twitId).then(async (res) => {
			const twitterMedia = res.media[0];
			interaction.followUp({ content: twitterMedia.url });
		});
	},
};
