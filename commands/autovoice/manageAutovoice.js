const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { autoChannelData } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('voice')
		.setDescription('Manage your personal child channel.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('user_limit')
				.setDescription('Set the user limit for your channel.')
				.addIntegerOption((option) =>
					option.setName('limit').setDescription('The user limit for your channel. 0 is no limit.').setMinValue(0).setMaxValue(99).setRequired(true)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('kick')
				.setDescription('Kick a user from your channel.')
				.addUserOption((option) => option.setName('user').setDescription('The user to kick.').setRequired(true))
		)
		.addSubcommand((subCommand) => subCommand.setName('delete').setDescription('Delete your channel.')),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply({ ephemeral: true });

		// Check if the user is in a voice channel
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You need to be in a voice channel to use this command.', ephemeral: true });

		// Check that the child channel is owned by the user
		const findData = await autoChannelData.findOne({ guildId: interaction.guild.id, 'masterChannels.childChannels.childId': interaction.member.voice.channel.id });
		if (!findData) return interaction.editReply({ content: 'You are not in a child channel.', ephemeral: true });
		if (!findData.masterChannels[0].childChannels.find((channel) => channel.childId === interaction.member.voice.channel.id && channel.createdBy === interaction.user.id))
			return interaction.editReply({ content: 'You do not own this channel.', ephemeral: true });

		// Get the child voice channel
		const childChannel = interaction.member.voice.channel;

		// Get subcommand
		const subCommand = interaction.options.getSubcommand();

		// switch subCommand
		switch (subCommand) {
			case 'user_limit':
				// Get the user limit
				const limit = interaction.options.getInteger('limit');

				// Set the user limit
				await interaction.member.voice.channel.setUserLimit(limit);
				interaction.followUp(`User limit set to ${limit}.`);
				break;

			case 'kick':
				// Get the user to kick
				const user = interaction.options.getUser('user');

				// Check that the user isnt trying to kick themselves
				if (user.id === interaction.user.id) return interaction.followUp({ content: 'You cannot kick yourself.', ephemeral: true });

				// Check if the user is in the channel
				if (!childChannel.members.has(user.id)) return interaction.followUp({ content: 'User is not in the channel.', ephemeral: true });

				// Check if the user is kickable
				if (!childChannel.members.get(user.id).kickable) return interaction.followUp({ content: 'User is not kickable.', ephemeral: true });

				// Kick the user
				await childChannel.members.get(user.id).voice.disconnect();
				interaction.followUp({ content: `${user.displayName} has been kicked from the channel.`, ephemeral: true });
				break;

			case 'delete':
				// Delete the child channel
				await interaction.member.voice.channel.delete();
				// Check that a channel exists to reply to
				if (interaction.channel) {
					interaction.followUp({ content: 'Your channel has been deleted.', ephemeral: true });
				}
				break;
		}
	},
};
