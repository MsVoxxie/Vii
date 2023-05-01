const { Events, EmbedBuilder } = require('discord.js');
const { Guild } = require('../../models/index');
const grantUserXp = require('../../functions/xpFuncs/grantUserXp');
const grantUserLevel = require('../../functions/xpFuncs/grantUserLevel');
const calculateLevelXp = require('../../functions/xpFuncs/calculateLevelXp');
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
			// Get the guild level channel
			const guildSettings = await Guild.findOne({ guildId: message.guild.id });
			// Check if the guild has a level channel
			if (!guildSettings.levelChannelId) return;
			// Get the level channel
			const levelChannel = await client.channels.cache.get(guildSettings.levelChannelId);
			// Calculate the amount of xp needed to level up
			const xpNeeded = calculateLevelXp(dbResults.level);

			// Build embed
			const embed = new EmbedBuilder()
				.setTitle('Level Up!')
				.setDescription(`Congratulations ${message.author}!\nYou have leveled up to level ${dbResults.level}!\n[Jump to Level Message](${message.url})`)
				.setFooter({ text: `You need ${xpNeeded} more Xp to level up again!` })
				.setThumbnail(message.member.displayAvatarURL({ dynamic: true }))
				.setColor(guildSettings.guildColorHex);

			// Send the level up message
			await levelChannel.send({ embeds: [embed] });
		}

		// Add the user to the timeout set
		xpTimeout.add(message.author.id);
		setTimeout(() => {
			xpTimeout.delete(message.author.id);
		}, 15 * 1000);
	},
};
