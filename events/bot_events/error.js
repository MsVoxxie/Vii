const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.Error,
	runType: 'infinite',
	async execute(error) {
		Logger.error(error);
	},
};
