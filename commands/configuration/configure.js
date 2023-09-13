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
				.setName('levelchannel')
				.setDescription('Configure the level channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the level channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the level channel to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the level channel'))
		),
	options: {
		devOnly: true,
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
		}
	},
};
