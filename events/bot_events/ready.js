const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.ClientReady,
	runType: 'single',
	execute(client) {
		Logger.success(`Ready! Logged in as ${client.user.tag}`);
		client.mongoose.init();
	},
};
