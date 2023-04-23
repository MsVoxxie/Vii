const grantVoiceXp = require('../../functions/xpFuncs/grantVoiceXp');

module.exports = {
	name: 'everyMinute',
	runType: 'infinite',
	async execute(client) {
		grantVoiceXp(client);
	},
};
