const { Level } = require('../../models/index');
const Logger = require('../logging/logger');
const calculateLevelXp = require('./calculateLevelXp');

module.exports = async (client, guild, member, dbResults) => {
	// Check that dbResults is an object
	if (typeof dbResults !== 'object') throw new Error('Invalid Argument: dbResults is not an object');

	// Spread the dbResults object
	let { xp, level } = dbResults;

	// Calculate the amount of xp needed to level up
	const xpNeeded = calculateLevelXp(level);

	// Check if the user has leveled up
	if (xp < xpNeeded) return false;

	// Level up the user
	++level;
	xp -= xpNeeded;

	// Logger
	if (client.debug) {
		Logger.info(`User ${member.user.tag} has leveled up to level ${level} in guild ${guild.name}`);
	}

	// Update the user's level and xp in the database
	await Level.findOneAndUpdate(
		{ userId: member.id, guildId: guild.id },
		{ userId: member.id, guildId: guild.id, xp, level },
		{ upsert: true, new: true }
	);

	// Return true for external use
	return true;
};
