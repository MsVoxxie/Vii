const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { URLRegexes, Colors } = require('../../functions/linkfix/constants');
const { Favicons } = require('../../images/icons/favs');
const { getPost } = require('../../functions/linkfix/getPost');

module.exports = {
	name: Events.MessageCreate,
	runType: 'disabled',
	async execute(client, message) {
		const RegEx = URLRegexes.TWITTER;
		const tweetID = message.content.match(RegEx);
		if (!tweetID) return;

		// Fetch Data
		const data = await getPost(tweetID[2]);
		const profileURL = `https://twitter.com/${data.tweetBy.userName}`;
		const twitTimestamp = Date.parse(data.createdAt);

		// Build Embed
		const embed = new EmbedBuilder()
			.setAuthor({ name: `${data.tweetBy.fullName} (@${data.tweetBy.userName})`, iconURL: data.tweetBy.profileImage, url: profileURL })
			.addFields({ name: '❤ Likes', value: data.likeCount.toString(), inline: true },{ name: '🔁 Retweets', value: data.retweetCount.toString(), inline: true })
			.setFooter({ iconURL: Favicons.TWITTER, text: 'Twitter' })
			.setImage(data.entities.media[0])
			.setDescription(`${data.fullText}`)
			.setTimestamp(twitTimestamp)
			.setColor(Colors.TWITTER);

		await message.delete();
		await message.channel.send({ embeds: [embed] });
	},
};
