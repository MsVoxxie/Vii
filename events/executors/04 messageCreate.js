const { Events } = require('discord.js');

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
	},
};
