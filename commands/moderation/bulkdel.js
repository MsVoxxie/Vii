const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { Favicons } = require('../../images/icons/favs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bulkdel')
		.setDescription('Delete multiple messages at once')
		.addNumberOption((option) => option.setName('amount').setDescription('Number of messages to delete').setMinValue(1).setMaxValue(99).setRequired(true))
		.addUserOption((option) => option.setName('user').setDescription('Filter messages by user').setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const amount = interaction.options.getNumber('amount');
		const targetUser = interaction.options.getUser('user');

		try {
			// Fetch more messages if filtering by user to ensure we get enough
			const fetchLimit = targetUser ? Math.min(100, amount * 3) : amount;
			const messages = await interaction.channel.messages.fetch({ limit: fetchLimit });

			let messagesToDelete = Array.from(messages.values());

			// Filter by user if specified
			if (targetUser) {
				messagesToDelete = messagesToDelete.filter((msg) => msg.author.id === targetUser.id);
				// Limit to the amount requested
				messagesToDelete = messagesToDelete.slice(0, amount);
			}

			// Filter out messages older than 14 days (Discord API limitation)
			const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
			messagesToDelete = messagesToDelete.filter((msg) => msg.createdTimestamp > twoWeeksAgo);

			if (messagesToDelete.length === 0) {
				return await interaction.editReply({
					content: 'No messages found to delete (messages must be less than 14 days old).',
				});
			}

			// Bulk delete
			await interaction.channel.bulkDelete(messagesToDelete, true);

			// Create response embed
			const embed = new EmbedBuilder()
				.setColor('#00ff00')
				.setTitle('Messages Deleted')
				.setDescription(`Successfully deleted ${messagesToDelete.length} message${messagesToDelete.length === 1 ? '' : 's'}${targetUser ? ` from ${targetUser.tag}` : ''}.`)
				.setTimestamp()
				.setFooter({ text: `Deleted by ${interaction.user.tag}`, iconURL: Favicons.Check });

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error('Error in bulkdel command:', error);
			await interaction.editReply({
				content: 'There was an error deleting messages. Make sure I have the proper permissions and that messages are less than 14 days old.',
			});
		}
	},
};
