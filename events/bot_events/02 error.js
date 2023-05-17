const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.Error,
	runType: 'infinity',
	async execute(client, error) {
		Logger.error(error);
	},
};
