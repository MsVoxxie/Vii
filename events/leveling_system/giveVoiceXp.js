const grantVoiceXp = require('../../functions/xpFuncs/grantVoiceXp');

module.exports = {
	name: 'everyMinute',
	runType: 'infinity',
	async execute(client) {
		await grantVoiceXp(client);
	},
};
