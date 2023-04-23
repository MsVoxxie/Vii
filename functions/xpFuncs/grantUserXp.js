const Logger = require('../logging/logger');
const { Level } = require('../../models/index');
const giveRandomXp = require('./giveRandomXp');

module.exports = async (interaction, min = 15, max = 25) => {
	// Check that the interaction is in a guild
	if (!interaction.inGuild()) throw new Error('Invalid Interaction: Not in a guild');
	// Check that the interaction author is not a bot
	if (interaction.author.bot) throw new Error('Invalid Interaction: Author is a bot');

	// Calculate the amount of xp to give
	const xpToGive = giveRandomXp(min, max);

	// Update the user's level and xp in the database
	const dbResult = await Level.findOneAndUpdate(
		{ userId: interaction.author.id, guildId: interaction.guild.id },
		{ userId: interaction.author.id, guildId: interaction.guild.id, $inc: { xp: xpToGive } },
		{ upsert: true, new: true }
	);

	// Logger
	Logger.info(`User ${interaction.author.tag} has been given ${xpToGive} xp in guild ${interaction.guild.name}`);

	// Return the database result
	return dbResult;
};
