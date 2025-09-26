const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { roleAssignmentData } = require('../../models/index');
const generateId = require('../../functions/helpers/generateId');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Reaction Role configuration')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('create')
				.setDescription('Create a new reaction role')
				.addStringOption((option) => option.setName('messagelink').setDescription('The link to the message to add this reaction role to').setRequired(true))
				.addRoleOption((option) => option.setName('role').setDescription('The role to assign').setRequired(true))
				.addStringOption((option) => option.setName('emoji').setDescription('The emoji to associate with this role').setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('remove')
				.setDescription('Remove a reaction role from this server')
				.addStringOption((option) => option.setName('identifier').setDescription('The unique identifier of the created role to remove').setRequired(true))
		),

	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get subcommand
		const subCommand = interaction.options.getSubcommand();
		await interaction.deferReply();

		switch (subCommand) {
			case 'create':
				// Check for valid options
				if (!interaction.options.getString('messagelink').startsWith('https://discord.com/channels/'))
					return interaction.followUp({ content: 'The message link you provided is not valid.', flags: MessageFlags.Ephemeral });
				const emojiTest = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
				if (emojiTest.test(interaction.options.getString('emoji')) === false)
					return interaction.followUp({ content: 'The emoji you provided is not a valid emoji.', flags: MessageFlags.Ephemeral });

				// Get options
				const msgLink = interaction.options.getString('messagelink').split('/').slice(5);
				const msgChan = await interaction.guild.channels.fetch(msgLink[0]);
				const fetchedMessage = await msgChan.messages.fetch(msgLink[1], { force: true });
				const roleId = interaction.options.getRole('role');
				const emojiId = interaction.options.getString('emoji');
				const uniqueIdentifier = generateId(8);

				// Check that we can add roles to this message
				const reactionCount = await fetchedMessage.reactions.cache.size;
				if (reactionCount >= 20)
					return interaction.followUp({ content: 'This message has too many reactions already.\nPlease create a new message and try again.', flags: MessageFlags.Ephemeral });

				// Check if this emoji has already been used on this message
				const checkEmoji = await fetchedMessage.reactions.cache.get(emojiId)?.count;
				if (checkEmoji) return interaction.followUp({ content: 'This emoji is already used for this message.\nPlease try another.', flags: MessageFlags.Ephemeral });

				// Check if this role already exists
				const checkRoles = await roleAssignmentData.exists({ guildId: interaction.guild.id, roleId: roleId.id }).lean();
				if (checkRoles) return interaction.followUp({ content: 'This role has already been added to this guild.', flags: MessageFlags.Ephemeral });

				// Create database entry
				await roleAssignmentData
					.create({
						guildId: interaction.guild.id,
						messageId: fetchedMessage.id,
						channelId: msgChan.id,
						roleId: roleId.id,
						emojiId: emojiId,
						uniqueIdentifier: uniqueIdentifier,
					})
					.then(async () => {
						// Add reaction to message
						await fetchedMessage.react(emojiId);

						// Generate Embed
						const embed = new EmbedBuilder()
							.setTitle('Reaction Role Created')
							.setDescription(
								`**Identifier:** \`${uniqueIdentifier}\`\n**Emoji:** ${emojiId}\n**Role:** ${roleId}\n**Channel:** ${msgChan}\n[Message Link](${fetchedMessage.url})`
							)
							.setColor(client.colors.vii)
							.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
							.setFooter({ text: 'Please keep this identifier safe as it is used to remove roles.' });

						interaction.followUp({ embeds: [embed] });
					})
					.catch((e) => interaction.followUp({ content: 'An error occurred while creating this role. Please try again', flags: MessageFlags.Ephemeral }));

				break;

			case 'remove':
				// Get options
				const reactionIdentifier = interaction.options.getString('identifier');

				// Fetch database entry for the itentifier
				const reactionData = await roleAssignmentData.findOne({ guildId: interaction.guild.id, uniqueIdentifier: reactionIdentifier });
				if (!reactionData) return interaction.followUp({ content: 'The ID you provided does not exist in my database', flags: MessageFlags.Ephemeral });

				// Fetch the channel and remove the reaction
				const reactionChannel = await interaction.guild.channels.fetch(reactionData.channelId);
				const reactionMessage = await reactionChannel.messages.fetch(reactionData.messageId);
				await reactionMessage.reactions.cache.get(reactionData.emojiId).remove();

				// Remove the entry from the database
				await roleAssignmentData
					.findOneAndDelete({ guildId: interaction.guild.id, uniqueIdentifier: reactionIdentifier })
					.then(async () => {
						// Create embed
						const embed = new EmbedBuilder()
							.setTitle('Reaction Role Deleted')
							.setDescription(`**Identifier:** \`${reactionIdentifier}\` has been deleted.`)
							.setColor(client.colors.vii)

							.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

						await interaction.followUp({ embeds: [embed] });
					})
					.catch((e) => interaction.followUp({ content: 'An error occurred while deleting this role. Please try again', flags: MessageFlags.Ephemeral }));
				break;
		}
	},
};
