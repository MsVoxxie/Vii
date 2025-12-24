const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, msg) {
		const mentionPrefix = `<@${client.user.id}>`;
		if (!msg.content.toLowerCase().startsWith(mentionPrefix)) return;
		const args = msg.content.slice(mentionPrefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		switch (command) {
			case 'wake':
				const wsPing = `\`${Math.round(client.ws.ping)}ms\``;
				let replies = [
					`Uwaah! I'm awake!\nDoing my best with ${wsPing} response times!`,
					`${client.user.username}, Reporting for Duty!\nOperating within ${wsPing} response times!`,
					`I'm here, I'm here!\nMy response time is ${wsPing}!`,
					`Ah! Sorry ${msg.member.displayName}, I'm here now!\nResponse time is ${wsPing}!`,
				];
				const randReply = replies[Math.floor(Math.random() * replies.length)];
				msg.reply(randReply);
				break;

			case 'fish':
				msg.channel.send('[Fi.sh](https://archive.vxie.me/content/vii/videos/replies/carp.mp4)');
				break;
			case 'plap':
				msg.channel.send('[Plap!](https://archive.vxie.me/content/vii/videos/replies/plap.mp4)');
				break;
			case 'gorp':
				msg.channel.send('[Gorp!](https://archive.vxie.me/content/vii/videos/replies/gorp.mp4)');
				break;
			case 'gup':
				msg.channel.send('[Gup!](https://archive.vxie.me/content/vii/videos/replies/gup.mp4)');
				break;
			case 'toot':
				msg.channel.send('[TooT!](https://archive.vxie.me/content/vii/videos/replies/toot.mp4)');
				break;
			case '💨':
				msg.channel.send('[Wake Up](https://archive.vxie.me/content/vii/videos/replies/wakeup.mp4)');
				break;
		}
	},
};
