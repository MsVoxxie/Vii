const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { Rettiwt } = require('rettiwt-api');
const twitFetch = new Rettiwt();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rawtweet')
		.setDescription('Retrieve the raw media from a specified tweet!')
		.addStringOption((option) => option.setName('tweet_url').setDescription('twitter url').setRequired(true)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		await interaction.deferReply();
		const twitURL = interaction.options.getString('tweet_url');
		const twitId = /\/status\/(\d+)/s.exec(twitURL);

		if (!twitId) return interaction.followUp('This is an invalid url or the tweet cannot be retrieved!');

		await twitFetch.tweet.details(twitId[1]).then(async (res) => {
			console.log(res.fullText);
			const fileAttachments = [];
			if (!res.media) return interaction.followUp("Sorry, this tweet doesn't contain any media!");
			for await (const attach of res.media) {
				const attachment = attach;
				fileAttachments.push(new AttachmentBuilder(attachment.url));
			}

			await interaction.followUp({ content: `${res.fullText ? res.fullText : ''}`, files: fileAttachments.map((a) => a) });
		});
	},
};
