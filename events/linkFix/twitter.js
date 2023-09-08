const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { URLRegexes } = require('../../functions/linkfix/constants');
const { getPost } = require('../../functions/linkfix/getPost');

module.exports = {
	name: Events.MessageCreate,
	runType: 'disabled',
	async execute(client, message) {
		const RegEx = URLRegexes.TWITTER;
		const tweetID = message.content.match(RegEx);
		if (!tweetID) return;
		console.log(tweetID);

		const data = await getPost(tweetID[2]);
        console.log(data);
	},
};
