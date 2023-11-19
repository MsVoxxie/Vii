const { Events, EmbedBuilder } = require('discord.js');
const { roleAssignmentData } = require('../../models/index');

module.exports = {
	name: Events.MessageReactionRemove,
	runType: 'infinity',
	async execute(client, reaction, user) {
		// Ignore bots
		if (user.bot) return;

		// Define message for sanity
		const message = reaction.message;

		// Fetch the reaciton.
		const fetchedReaction = await roleAssignmentData.findOne({
			guildId: message.guild.id,
			messageId: message.id,
			channelId: message.channel.id,
			emojiId: reaction.emoji.name,
		});
		if (!fetchedReaction) return;
		if (reaction.emoji.name !== fetchedReaction.emojiId) return;

		// Define our constants
		const fetchedRole = await message.guild.roles.fetch(fetchedReaction.roleId);
		const targetMember = await message.guild.members.fetch(user.id);

		// Check if the indeed does not have the role
		if (!targetMember.roles.cache.has(fetchedRole.id)) return;

		// Apply the role
		try {
			await targetMember.roles.remove(fetchedRole);

			// Generate mini-embed
			const embed = new EmbedBuilder()
				.setDescription(`**Role Removal Success**\n__Removed__ the role **${fetchedRole.name}** in **${message.guild.name}**`)
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Notify the member
			await targetMember.send({ embeds: [embed] });
		} catch (error) {
			// Generate mini-embed
			const embed = new EmbedBuilder()
				.setDescription(`**Role Removal Failed**\nCould not __remove__ **${fetchedRole.name}** in **${message.guild.name}**`)
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Notify the member
			await targetMember.send({ embeds: [embed] });
		}
	},
};
