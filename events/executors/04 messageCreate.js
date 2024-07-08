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
		// Plap!
		if (command === 'plap') {
			msg.channel.send(
				'[Plap!](https://cdn.discordapp.com/attachments/988469231760838723/1024130111873753108/plap.mp4?ex=6685fa7e&is=6684a8fe&hm=b1b8063e08861bc8f948191c45fbd088cb09e093edf2f4325731e963759319aa&)'
			);
		}
	},
};
