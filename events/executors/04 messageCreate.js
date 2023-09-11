const { Events, messageLink } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, msg) {
		const mentionPrefix = `<@${client.user.id}>`;
		if (!msg.content.toLowerCase().startsWith(mentionPrefix)) return;
		const args = msg.content.slice(mentionPrefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		// Wake up
		if (command === 'wake') {
			const wsPing = `\`${Math.round(client.ws.ping)}ms\``;
			let replies = [
				`Uwaah! I'm awake!\nDoing my best with ${wsPing} response times!`,
				`${client.user.username}, Reporting for Duty!\nOperating within ${wsPing} response times!`,
				`I'm here, I'm here!\nMy response time is ${wsPing}!`,
				`Ah! Sorry ${msg.member.displayName}, I'm here now!\nResponse time is ${wsPing}!`,
			];
			const randReply = replies[Math.floor(Math.random() * replies.length)];
			msg.reply(randReply);
		}

		//Fish!
		if (command === 'fish') {
			msg.channel.send(
				'[Fi.sh](https://fish.voxxie.me/the/carp/is/a/hardy/greenish/brown/fish/it/is/native/to/eurasia/but/has/been/introduced/into/northamerica/and/elsewhere/a/large-scaled/fish/with/two/barbels/on/each/side/of/its/upper/jaw/the/carp/lives/alone/or/in/small/schools/in/quiet/weedy/mud-bottomed/ponds/lakes/and/rivers/carp.mp4)'
			);
		}
	},
};
