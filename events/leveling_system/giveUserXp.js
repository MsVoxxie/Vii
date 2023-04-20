const { Events } = require('discord.js');
const { Level } = require('../../models/index');
const Logger = require('../../functions/logging/logger');
const calculateLevelXp = require('../../functions/helpers/calculateLevelXp');
const xpTimeout = new Set();

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinite',
	async execute(message, client) {
		if (!message.inGuild() || message.author.bot || xpTimeout.has(message.author.id)) return;
		const xpToGive = getRandomXp(15, 25);
		// Update the user's level and xp in the database
		const dbResult = await Level.findOneAndUpdate(
            { userId: message.author.id, guildId: message.guild.id },
			{ userId: message.author.id, guildId: message.guild.id, $inc: { xp: xpToGive } },
			{ upsert: true, new: true }
            );
            
            // Add the user to the timeout set
            xpTimeout.add(message.author.id);
            setTimeout(() => {
                xpTimeout.delete(message.author.id);
            }, 15 * 1000);
            
            let { xp, level, neededXp } = dbResult;
            const xpNeeded = calculateLevelXp(level);
		if (xp >= xpNeeded) {
			++level;
			xp -= xpNeeded;

            // TODO: Add a level up message
			Logger.info(`User ${message.author.tag} has leveled up to level ${level} in guild ${message.guild.name}`);
			// message.reply(`You have leveled up to level ${level}!`);

			// Update the user's level and xp in the database
			await Level.findOneAndUpdate(
				{ userId: message.author.id, guildId: message.guild.id },
				{ userId: message.author.id, guildId: message.guild.id, xp, level },
				{ upsert: true, new: true }
			);
		}
	},
};

function getRandomXp(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
