const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.Debug,
	runType: 'disabled',
	async execute(debug) {
		Logger.info(debug);
	},
};
