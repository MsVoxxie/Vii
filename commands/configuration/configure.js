const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Guild } = require('../../models/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Configure the bot for your server')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('auditlog')
				.setDescription('Configure the audit log channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the audit log channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the audit log to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the audit log channel'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('modlog')
				.setDescription('Configure the mod log channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the mod log channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the mod log to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the mod log channel'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('welcomechannel')
				.setDescription('Configure the welcome channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the welcome channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the welcome channel to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the welcome channel'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('leavechannel')
				.setDescription('Configure the leave channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the leave channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the leave channel to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the leave channel'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('welcomemessage')
				.setDescription('Configure the welcome message')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setmessage')
						.setDescription('Set the welcome message')
						.addStringOption((option) => option.setName('message').setDescription('Templates: {SERVER_NAME} {USER_NAME} {USER_MENTION}').setRequired(true))
						.addStringOption((option) => option.setName('image').setDescription('Image URL to send with the message').setRequired(false))
				)
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('levelchannel')
				.setDescription('Configure the level channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the level channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the level channel to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the level channel'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('autofixlinks')
				.setDescription('Should links be automatically converted')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('toggle')
						.setDescription('Toggle between true or false')
						.addBooleanOption((option) => option.setName('toggle').setDescription('Is this system enabled or disabled?'))
				)
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('shouldrolenotify')
				.setDescription('Should I notify users about their roles?')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('toggle')
						.setDescription('Toggle between true or false')
						.addBooleanOption((option) => option.setName('toggle').setDescription('Is this system enabled or disabled?'))
				)
		),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get subcommand
		const subGroup = interaction.options.getSubcommandGroup();
		const subCommand = interaction.options.getSubcommand();

		// Defer, Things take time.
		await interaction.deferReply();

		// switch subGroup
		switch (subGroup) {
			// Audit log
			case 'auditlog':
				if (subCommand === 'setchannel') {
					// Get channel
					const auditLogChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!auditLogChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set audit log channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { auditLogId: auditLogChannel.id });
					// Follow up
					interaction.followUp(`Audit log channel set to ${auditLogChannel}`);
				} else if (subCommand === 'removechannel') {
					// Remove audit log channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { auditLogId: null });
					// Follow up
					interaction.followUp('Audit log channel removed');
				}
				break;
			// Mod log
			case 'modlog':
				if (subCommand === 'setchannel') {
					// Get channel
					const modLogChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!modLogChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set mod log channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { modLogId: modLogChannel.id });
					// Follow up
					interaction.followUp(`Mod log channel set to ${modLogChannel}`);
				} else if (subCommand === 'removechannel') {
					// Remove mod log channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { modLogId: null });
					// Follow up
					interaction.followUp('Mod log channel removed');
				}
				break;
			// Welcome channel
			case 'welcomechannel':
				if (subCommand === 'setchannel') {
					// Get channel
					const welcomeChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!welcomeChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set welcome channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { welcomeChannelId: welcomeChannel.id });
					// Follow up
					interaction.followUp(`Welcome channel set to ${welcomeChannel}`);
				} else if (subCommand === 'removechannel') {
					// Remove welcome channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { welcomeChannelId: null });
					// Follow up
					interaction.followUp('Welcome channel removed');
				}
				break;
			// Welcome message
			case 'welcomemessage':
				if (subCommand === 'setmessage') {
					// Get channel
					const welcomeMessage = interaction.options.getString('message');
					const welcomeImage = interaction.options.getString('image') || null;
					// Set welcome message
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { welcomeMessage: welcomeMessage, welcomeImage: welcomeImage });
					// Follow up
					interaction.followUp(`Welcome message set to ${welcomeMessage}.\n${welcomeImage ? `Image set to ${welcomeImage}` : ''}`);
				}
				break;
			// Leave channel
			case 'leavechannel':
				if (subCommand === 'setchannel') {
					// Get channel
					const leaveChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!leaveChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set leave channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { leaveChannelId: leaveChannel.id });
					// Follow up
					interaction.followUp(`Leave channel set to ${leaveChannel}`);
				} else if (subCommand === 'removechannel') {
					// Remove leave channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { leaveChannelId: null });
					// Follow up
					interaction.followUp('Leave channel removed');
				}
				break;
			// Level channel
			case 'levelchannel':
				if (subCommand === 'setchannel') {
					// Get channel
					const levelChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!levelChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set level channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { levelChannelId: levelChannel.id });
					// Follow up
					interaction.followUp(`Level channel set to ${levelChannel}`);
				} else if (subCommand === 'removechannel') {
					// Remove level channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { levelChannelId: null });
					// Follow up
					interaction.followUp('Level channel removed');
				}
				break;
			// ShouldFixLinks
			case 'autofixlinks':
				if (subCommand === 'toggle') {
					// Get channel
					const toggleSwitch = interaction.options.getBoolean('toggle');
					// Set the toggle
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { shouldFixLinks: toggleSwitch });
					// Follow up
					interaction.followUp(`Link fixing is now set to ${toggleSwitch}`);
				}
				break;
			// shouldRoleNotify
			case 'shouldrolenotify':
				if (subCommand === 'toggle') {
					// Get channel
					const toggleSwitch = interaction.options.getBoolean('toggle');
					// Set the toggle
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { shouldRoleNotify: toggleSwitch });
					// Follow up
					interaction.followUp(`Role notifications are now set to ${toggleSwitch}`);
				}
				break;
		}
	},
};
