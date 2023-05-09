const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('Create a giveaway or edit an existing one.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('start')
				.setDescription('Start a giveaway')
				.addStringOption((option) =>
					option.setName('duration').setDescription('How long the giveaway should last. (1d, 1h, 1m, 1s)').setRequired(true)
				)
				.addIntegerOption((option) =>
					option.setName('winners').setDescription('How many winners the giveaway should have.').setMinValue(1).setRequired(true)
				)
				.addStringOption((option) => option.setName('prize').setDescription('What the prize of the giveaway should be.').setRequired(true))
				.addChannelOption((option) => option.setName('channel').setDescription('The channel to start the giveaway in.').setRequired(false))
				.addStringOption((option) => option.setName('content').setDescription('The content of the giveaway message.').setRequired(false))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('edit')
				.setDescription('Edit an existing giveaway')
				.addStringOption((option) => option.setName('message_id').setDescription('The message ID of the giveaway to edit.').setRequired(true))
				.addStringOption((option) => option.setName('time').setDescription('The added duration of the giveaway in MS').setRequired(true))
				.addIntegerOption((option) => option.setName('winners').setDescription('The new amount of winners').setRequired(true))
				.addStringOption((option) => option.setName('prize').setDescription('The new prize').setRequired(false))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('end')
				.setDescription('End an existing giveaway')
				.addStringOption((option) => option.setName('message_id').setDescription('The message ID of the giveaway to end.').setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('reroll')
				.setDescription('Reroll an existing giveaway')
				.addStringOption((option) => option.setName('message_id').setDescription('The message ID of the giveaway to reroll.').setRequired(true))
		),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get subcommand and variables
		const subCommand = interaction.options.getSubcommand();
		const lastChanceThreshold = 60000000000_000;

		// Switch subcommand
		switch (subCommand) {
			case 'start':
				// Reply to let the user know the giveaway is being created
				await interaction.reply({ content: 'Creating giveaway...', ephemeral: true });

				// Get options
				const duration = ms(interaction.options.getString('duration') || '');
				const winnerCount = interaction.options.getInteger('winners');
				const prize = interaction.options.getString('prize');
				const mainContent = interaction.options.getString('content');
				const channel = interaction.options.getChannel('channel');
				const showChannel = interaction.options.getChannel('channel') || interaction.channel;

				// If no channel and no main content
				if (!channel && !mainContent) {
					client.giveawayManager.start(interaction.channel, {
						prize: prize,
						winnerCount: winnerCount,
						duration: duration,
						hostedBy: interaction.user,
						lastChance: {
							enabled: false,
							content: mainContent,
							threshold: lastChanceThreshold,
							embedColor: client.colors.warning,
						},
						messages: {
							giveaway: '🎁 **Giveaway Time** 🎁',
							giveawayEnded: '🎁 **Giveaway Ended** 🎁',
							inviteToParticipate: 'React with 🎁 to participate!',
						},
					});
				}

				// If no channel was provided
				else if (!channel) {
					client.giveawayManager.start(interaction.channel, {
						prize: prize,
						winnerCount: winnerCount,
						duration: duration,
						hostedBy: interaction.user,
						lastChance: {
							enabled: true,
							content: mainContent,
							threshold: lastChanceThreshold,
							embedColor: client.colors.warning,
						},
						messages: {
							giveaway: '🎁 **Giveaway Time** 🎁',
							giveawayEnded: '🎁 **Giveaway Ended** 🎁',
							inviteToParticipate: 'React with 🎁 to participate!',
						},
					});
				}

				// If no main content was provided
				else if (!mainContent) {
					client.giveawayManager.start(channel, {
						prize: prize,
						winnerCount: winnerCount,
						duration: duration,
						hostedBy: interaction.user,
						lastChance: {
							enabled: false,
							content: mainContent,
							threshold: lastChanceThreshold,
							embedColor: client.colors.warning,
						},
						messages: {
							giveaway: '🎁 **Giveaway Time** 🎁',
							giveawayEnded: '🎁 **Giveaway Ended** 🎁',
							inviteToParticipate: 'React with 🎁 to participate!',
						},
					});
				}

				// If both channel and main content were provided
				else {
					client.giveawayManager.start(channel, {
						prize: prize,
						winnerCount: winnerCount,
						duration: duration,
						hostedBy: interaction.user,
						lastChance: {
							enabled: true,
							content: mainContent,
							threshold: lastChanceThreshold,
							embedColor: client.colors.warning,
						},
						messages: {
							giveaway: '🎁 **Giveaway Time** 🎁',
							giveawayEnded: '🎁 **Giveaway Ended** 🎁',
							inviteToParticipate: 'React with 🎁 to participate!',
						},
					});
				}

				// Edit reply to let the user know the giveaway was created
				await interaction.editReply({ content: `Giveaway created in ${showChannel}.`, ephemeral: true });
				break;
			case 'edit':
				// Reply to let the user know the giveaway is being edited
				await interaction.reply({ content: 'Editing giveaway...', ephemeral: true });

				// Get options
				const newPrize = interaction.options.getString('prize');
				const newDuration = interaction.options.getString('time');
				const newWinnerCount = interaction.options.getInteger('winners');
				const messageId = interaction.options.getString('message_id');

				// Edit giveaway
				client.giveawayManager
					.edit(messageId, {
						addTime: ms(newDuration),
						newWinnerCount: newWinnerCount,
						newPrize: newPrize,
					})
					.then(() => {
						interaction.editReply({ content: `Giveaway edited.`, ephemeral: true });
					})
					.catch((err) => {
						interaction.editReply({ content: `An error occured editing your giveaway.`, ephemeral: true });
					});
				break;

			case 'end':
				// Reply to let the user know the giveaway is being ended
				await interaction.reply({ content: 'Ending giveaway...', ephemeral: true });

				// Get options
				const endMessageId = interaction.options.getString('message_id');

				// End giveaway
				client.giveawayManager
					.end(endMessageId)
					.then(() => {
						interaction.editReply({ content: `Giveaway ended.`, ephemeral: true });
					})
					.catch((err) => {
						interaction.editReply({ content: `An error occured ending your giveaway.`, ephemeral: true });
					});
				break;

			case 'reroll':
				// Reply to let the user know the giveaway is being rerolled
				await interaction.reply({ content: 'Rerolling giveaway...', ephemeral: true });

				// Get options
				const query = interaction.options.getString('message_id');
				const findGiveaway =
					client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query) ||
					client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query);

				// If no giveaway was found
				if (!findGiveaway) return interaction.editReply({ content: `No giveaway found for \`${query}\`.`, ephemeral: true });

				// Reroll giveaway
				client.giveawayManager
					.reroll(query, {
						messages: {
							congrat: '🎁 New winner(s): {winners}! Congratulations, you won **{prize}**!\n{messageURL}',
						},
					})
					.then(() => {
						interaction.editReply({ content: `Giveaway rerolled.`, ephemeral: true });
					})
					.catch((err) => {
						interaction.editReply({ content: `An error occured rerolling your giveaway.`, ephemeral: true });
					});
				break;
		}
	},
};
