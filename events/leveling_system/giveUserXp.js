const { Events, EmbedBuilder } = require('discord.js');
const { Guild } = require('../../models/index');
const grantUserXp = require('../../functions/xpFuncs/grantUserXp');
const grantUserLevel = require('../../functions/xpFuncs/grantUserLevel');
const checkLevelRoles = require('../../functions/xpFuncs/checkLevelRoles');
const calculateLevelXp = require('../../functions/xpFuncs/calculateLevelXp');
const xpTimeout = new Set();

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Check that the user is not a bot
		if (message.author.bot) return;
		// Check that the user is not in the timeout set
		if (xpTimeout.has(message.author.id)) return;
		// Get the guild level channel
		const guildSettings = await Guild.findOne({ guildId: message.guild.id });
		// Check if the guild has a level channel
		if (!guildSettings.levelChannelId) return;
		
		// Grant the user xp
		const dbResults = await grantUserXp(client, message, 15, 25);

		// Check if the user leveled up
		const didUserLevel = await grantUserLevel(client, message, dbResults);

		//? If the user leveled up send a message
		if (didUserLevel.leveled) {
			// Get the level channel
			const levelChannel = await client.channels.cache.get(guildSettings.levelChannelId);
			// Calculate the amount of xp needed to level up
			const xpNeeded = calculateLevelXp(dbResults.level + 1);
			const calcXp = xpNeeded - didUserLevel.xp;

			// Check for level roles
			const roleCheck = await checkLevelRoles(message.guild, message.member, dbResults.level + 1);
			const roleText = `${roleCheck.addedRoles.length ? `\nAwarded Role${roleCheck.addedRoles.length >= 1 ? 's›\n' : '›\n'}` : ''}${roleCheck.addedRoles.map((r) => r).join(' | ')}\n${roleCheck.removedRoles.length ? `\nRevoked Role${roleCheck.removedRoles.length >= 1 ? 's›\n' : '›\n'}` : ''}${roleCheck.removedRoles.map((r) => r).join(' | ')}`
			// Build embed
			const embed = new EmbedBuilder()
				.setTitle('Level Up!')
				.setDescription(`Congratulations ${message.author}!\nYou have leveled up to level ${dbResults.level + 1}!${roleText}\n[Jump to Level Message](${message.url})`)
				.setFooter({ text: `You need ${calcXp} more Xp to level up again!` })
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setThumbnail(message.member.displayAvatarURL({ dynamic: true }))
				.setColor(client.colors.vii);

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
