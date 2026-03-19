const { Events, EmbedBuilder } = require('discord.js');
const { roleAssignmentData } = require('../../models/index');

module.exports = {
	name: Events.MessageReactionAdd,
	runType: 'infinity',
	async execute(client, reaction, user) {
		// Ignore bots
		if (user.bot) return;

		// Define message for sanity
		const message = await reaction.message;

		// Fetch guild settings
		const settings = await client.getGuild(message.guild);

		// Fetch the reaction (support stored unicode or custom emoji id)
		const fetchedReaction = await roleAssignmentData.findOne({
			guildId: message.guild.id,
			messageId: message.id,
			channelId: message.channel.id,
			$or: [{ emojiId: reaction.emoji.id }, { emojiId: reaction.emoji.name }],
		});
		if (!fetchedReaction) return;

		// Define our constants
		const fetchedRole = await message.guild.roles.fetch(fetchedReaction.roleId);
		const targetMember = await message.guild.members.fetch(user.id);

		// Check if the indeed does not have the role
		if (targetMember.roles.cache.has(fetchedRole.id)) return;

		// Apply the role
		try {
			await targetMember.roles.add(fetchedRole);

			// Generate mini-embed
			const embed = new EmbedBuilder()
				.setDescription(`**Role Application Success**\n__Applied__ the role **${fetchedRole.name}** in **${message.guild.name}**`)
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Notify the member
			if (settings.shouldRoleNotify) {
				await targetMember.send({ embeds: [embed] });
			}
		} catch (error) {
			// Generate mini-embed
			const embed = new EmbedBuilder()
				.setDescription(`**Role Application Failed**\nCould not __apply__ **${fetchedRole.name}** in **${message.guild.name}**`)
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Notify the member
			if (settings.shouldRoleNotify) {
				await targetMember.send({ embeds: [embed] });
			}
		}
	},
};
