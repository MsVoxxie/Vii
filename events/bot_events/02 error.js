const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.Error,
	runType: 'infinity',
	async execute(error) {
		Logger.error(error);
	},
};
