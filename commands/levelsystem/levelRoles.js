const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { levelRoles } = require('../../models/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levelroles')
		.setDescription('Manage level roles')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.setDMPermission(false)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('add')
				.setDescription('Add a level role')
				.addRoleOption((option) => option.setName('role').setDescription('Role to add').setRequired(true))
				.addIntegerOption((option) => option.setName('level').setDescription('Level to add role at').setMinValue(1).setRequired(true))
				.addStringOption((option) =>
					option.setName('type').setDescription('Type of role to add').addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }).setRequired(true)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('remove')
				.setDescription('Remove a level role')
				.addRoleOption((option) => option.setName('role').setDescription('Role to remove').setRequired(true))
				.addStringOption((option) =>
					option.setName('type').setDescription('Type of role to remove').addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }).setRequired(true)
				)
		),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Get subcommand
		const subCommand = interaction.options.getSubcommand();

		// Switch subcommand
		switch (subCommand) {
			// Add
			case 'add':
				// Get options
				const roleToAdd = interaction.options.getRole('role');
				const levelToAdd = interaction.options.getInteger('level');
				const typeToAdd = interaction.options.getString('type');

				// Check if role already exists
				const roleExists = await levelRoles.findOne({
					guildId: interaction.guild.id,
					roleId: roleToAdd.id,
					level: levelToAdd,
					roleType: typeToAdd,
				});
				if (roleExists) return interaction.followUp(`Role already exists for level ${levelToAdd} with type ${typeToAdd}`);

				// Create role
				await levelRoles.create({
					guildId: interaction.guild.id,
					roleId: roleToAdd.id,
					roleType: typeToAdd,
					level: levelToAdd,
				});

				// Send response
				interaction.followUp(`Added role ${roleToAdd.name} for level ${levelToAdd} with type ${typeToAdd}`);
				break;

			// Remove
			case 'remove':
				// Get options
				const roleToRemove = interaction.options.getRole('role');
				const typeToRemove = interaction.options.getString('type');

				// Check if role exists
				const roleDoesNotExist = await levelRoles.findOne({ guildId: interaction.guild.id, roleId: roleToRemove.id, roleType: typeToRemove });
				if (!roleDoesNotExist) return interaction.followUp(`Role does not exist for type ${typeToRemove}`);

				// Delete role
				await levelRoles.deleteOne({ guildId: interaction.guild.id, roleId: roleToRemove.id, roleType: typeToRemove });

				// Send response
				interaction.followUp(`Removed role ${roleToRemove.name} for type ${typeToRemove}`);
				break;
		}
	},
};
