const { Events } = require('discord.js');
const grantUserXp = require('../../functions/xpFuncs/grantUserXp');
const grantUserLevel = require('../../functions/xpFuncs/grantUserLevel');
const xpTimeout = new Set();

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinite',
	async execute(message, client) {
		// Check that the user is not a bot
		if (message.author.bot) return;
		// Check that the user is not in the timeout set
		if (xpTimeout.has(message.author.id)) return;

		// Grant the user xp
		const dbResults = await grantUserXp(client, message, 15, 25);

		// Check if the user leveled up
		const didUserLevel = await grantUserLevel(client, message, dbResults);

		// TODO: Add a level up message
		if (didUserLevel) {
			// Do stuff later
		}

		// Add the user to the timeout set
		xpTimeout.add(message.author.id);
		setTimeout(() => {
			xpTimeout.delete(message.author.id);
		}, 15 * 1000);
	},
};
