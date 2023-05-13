const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.Error,
	runType: 'disabled',
	async execute(error) {
		Logger.error(error);
	},
};
