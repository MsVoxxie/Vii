const moment = require('moment');
const { Events } = require('discord.js');
const { botData } = require('../../models');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.ClientReady,
	runType: 'single',
	async execute(client) {
		Logger.success(`Ready! Logged in as ${client.user.tag}`);
		client.mongoose.init();

		// Database Entries
		await botData.findOneAndUpdate(
			{},
			{
				clientId: client.user.id,
				startTime: moment().format('MMMM Do YYYY, h:mm A'),
				startTimeUTC: Date.now(),
				$inc: { session: 1 },
			},
			{ upsert: true }
		);
	},
};
