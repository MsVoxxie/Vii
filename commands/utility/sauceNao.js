const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

const SauceNAO = require('sagiri');
const sauceNAO = SauceNAO(process.env.SAUCENAO);

module.exports = {
	data: new ContextMenuCommandBuilder().setName('Find Sauce Nao').setType(ApplicationCommandType.Message),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply({ ephemeral: false });

		// Definitions
		const message = interaction.targetMessage;

		// Check for media of some kind
		let attachedMedia = null;

		// Attachment
		if (message.embeds.length)
			attachedMedia = message.embeds[0].data.thumbnail
				? message.embeds[0].data.thumbnail.url
				: message.embeds[0].data.image.url
				? message.embeds[0].data.image.url
				: message.embeds[0].data.url;
		if (message.attachments.size) attachedMedia = message.attachments.first().url;

		// Check if this message contains any images.
		if (!attachedMedia) return interaction.followUp({ content: `[This message does not contain any images.](${message.url})` });

		// Grab the first image.
		const searchImage = attachedMedia;

		// Search for it.
		try {
			const fetchedResults = await sauceNAO(searchImage, { results: 5 });
			const resultData = fetchedResults[0];
			const rawData = resultData.raw.data;

			// Threshhold
			if (resultData.similarity < 70) return interaction.followUp({ content: `[No high similarity results...](${message.url})` });

			let compiledData = {
				thumbnail: resultData.thumbnail,
				similarity: resultData.similarity,
				material: rawData.material || null,
				characters: rawData.characters || null,
				creator: rawData.creator || rawData.member_name || rawData.user_name || rawData.author_name || 'Unknown',
				creator_id: rawData.member_id || rawData.user_id || null,
				creator_url: rawData.author_url || null,
				title: rawData.title || null,
				e621_id: rawData.e621_id || null,
				fa_id: rawData.fa_id || null,
				pixiv_id: rawData.pixiv_id || null,
				kemono_id: rawData.id || null,
				danbooru_id: rawData.danbooru_id || null,
				gelbooru_id: rawData.gelbooru_id || null,
				source: resultData.url || null,
				ext_urls: rawData.ext_urls || null,
			};

			// Build Embed
			const embed = new EmbedBuilder()
				.setURL(`${resultData.authorUrl ? resultData.authorUrl : resultData.url}`)
				.setTitle(`**SauceNAO (${compiledData.similarity}% Match)**`)
				.setThumbnail(compiledData.thumbnail)
				.setDescription(`Original Discord message can be found [Here](${message.url})`)
				.addFields({ name: 'Ext Urls', value: compiledData.ext_urls.map((u) => u).join('\n') });

			// Title
			if (compiledData.title) embed.addFields({ name: 'Title', value: `${compiledData.title}`, inline: true });

			// IDs
			if (compiledData.danbooru_id) embed.addFields({ name: 'Danbooru ID', value: `${compiledData.danbooru_id}`, inline: true });
			if (compiledData.gelbooru_id) embed.addFields({ name: 'Gelbooru ID', value: `${compiledData.gelbooru_id}`, inline: true });
			if (compiledData.kemono_id) embed.addFields({ name: 'Kemono ID', value: `${compiledData.kemono_id}`, inline: true });
			if (compiledData.e621_id) embed.addFields({ name: 'E621 ID', value: `${compiledData.e621_id}`, inline: true });
			if (compiledData.fa_id) embed.addFields({ name: 'FA ID', value: `${compiledData.fa_id}`, inline: true });

			// Creator
			if (compiledData.creator) embed.addFields({ name: 'Creator', value: `${compiledData.creator}`, inline: true });
			if (compiledData.creator_id) embed.addFields({ name: 'Creator ID', value: `${compiledData.creator_id}`, inline: true });
			if (compiledData.creator_url) embed.addFields({ name: 'Creator Url', value: `${compiledData.creator_url}`, inline: true });

			// Characters
			if (compiledData.material) embed.addFields({ name: 'Material', value: `${compiledData.material}`, inline: true });
			if (compiledData.characters) embed.addFields({ name: 'Characters', value: `${compiledData.characters}`, inline: true });

			// Source
			if (compiledData.source) embed.addFields({ name: 'Source', value: `${compiledData.source}`, inline: false });

			interaction.followUp({ embeds: [embed] });
		} catch (error) {
			console.log(error);
			return interaction.followUp({ content: `[There was an error communicating with the server.](${message.url})` });
		}
	},
};
