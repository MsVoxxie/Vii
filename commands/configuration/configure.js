const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Guild } = require('../../models/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Configure the bot for your server')
		.setDefaultMemberPermissions(PermissionsBitField.ManageGuild)
		.setDMPermission(false)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('auditlog')
				.setDescription('Set the audit log channel')
				.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the audit log to').setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('modlog')
				.setDescription('Set the mod log channel')
				.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the mod log to').setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('levelchannel')
				.setDescription('Set the level channel')
				.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the level channel to').setRequired(true))
		),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get subcommand
		const subCommand = interaction.options.getSubcommand();

		// Defer, Things take time.
		await interaction.deferReply();

		// Switch subcommand
		switch (subCommand) {
			// Audit log
			case 'auditlog':
				// Get channel
				const auditLogChannel = interaction.options.getChannel('channel');
				// Make sure channel is a text channel
				if (!auditLogChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
				// Set audit log channel
				await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { auditLogId: auditLogChannel.id });
				// Follow up
				interaction.followUp(`Audit log channel set to ${auditLogChannel}`);
				break;
			// Mod log
			case 'modlog':
				// Get channel
				const modLogChannel = interaction.options.getChannel('channel');
				// Make sure channel is a text channel
				if (!modLogChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
				// Set mod log channel
				await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { modLogId: modLogChannel.id });
				// Follow up
				interaction.followUp(`Mod log channel set to ${modLogChannel}`);
				break;
			// Level channel
			case 'levelchannel':
				// Get channel
				const levelChannel = interaction.options.getChannel('channel');
				// Make sure channel is a text channel
				if (!levelChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
				// Set level channel
				await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { levelChannelId: levelChannel.id });
				// Follow up
				interaction.followUp(`Level channel set to ${levelChannel}`);
				break;
		}
	},
};
