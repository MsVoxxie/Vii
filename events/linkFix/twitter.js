const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		const RegEx = /((https?):\/\/)?(www.)?[A-z0-9_.]{0,7}tw(i|x)tter\.com(\/@?(\w){1,15})\/status\/[0-9]{19}\S{0,30}/gi; // <-- new regex
		const Matches = [...message.content.matchAll(RegEx)].map((x) => x[0]);
		//Check if Message is a Tweet
		if (!Matches.length) return;
	},
};
