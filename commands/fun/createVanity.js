const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vanity')
		.setDescription('Create a personal vanity role!')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create your own vanity role!')
				.addStringOption((option) => option.setName('name').setDescription('The name of your vanity role').setRequired(true))
				.addStringOption((option) => option.setName('color').setDescription('The color of your vanity role (hex code)').setRequired(true))
		)
		.addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete your vanity role!'))
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// First, check if vanity roles are allowed by anyone
		if (!settings.allowAnyoneVanity) {
			return interaction.followUp({ content: 'Vanity roles are not allowed on this server.' });
		}

		const subcommand = interaction.options.getSubcommand();
		const userId = interaction.user.id;

		if (subcommand === 'create') {
			const roleName = interaction.options.getString('name');
			const roleColor = interaction.options.getString('color');

			// Make sure color is a valid hex code
			const hexColorRegex = /^#?[0-9A-Fa-f]{6}$/;
			if (!hexColorRegex.test(roleColor)) {
				return interaction.followUp({ content: 'Please provide a valid hex color code for the role color.' });
			}

			// Make sure role name length is valid
			if (roleName.length < 1 || roleName.length > 15) {
				return interaction.followUp({ content: 'Role name must be between 1 and 15 characters long.' });
			}

			// Check if user already has a vanity role
			const existingRole = interaction.guild.roles.cache.find((role) => role.name === `${interaction.user.username}'s Vanity Role`);
			if (existingRole) {
				try {
					// Update the existing role
					await existingRole.edit({
						name: roleName,
						color: roleColor,
						reason: `Vanity role updated by ${interaction.user.tag}`,
					});

					return interaction.followUp({ content: `Your vanity role "${existingRole.name}" has been updated!` });
				} catch (error) {
					console.error('Error updating vanity role:', error);
					return interaction.followUp({ content: 'There was an error updating your vanity role. Please ensure I have the necessary permissions.' });
				}
			}

			try {
				// Get the bot's highest role position
				const botMember = await interaction.guild.members.fetch(client.user.id);
				const botHighestRole = botMember.roles.highest;

				// Create the vanity role (without position - it will be created at the bottom)
				const newRole = await interaction.guild.roles.create({
					name: roleName,
					color: roleColor,
					reason: `Vanity role created by ${interaction.user.tag}`,
				});

				// Try to position it appropriately (below bot's highest role)
				try {
					// Get all roles sorted by position (highest first)
					const sortedRoles = interaction.guild.roles.cache.sort((a, b) => b.position - a.position);

					// Find the highest colored role that isn't an elevated staff role
					let targetPosition = 1; // Default position above @everyone

					for (const role of sortedRoles.values()) {
						// Skip @everyone role and bot's own role
						if (role.id === interaction.guild.id || role.managed) continue;

						// If role has color but no elevated permissions, this is where we want to be above
						if (
							role.color !== 0 &&
							!role.permissions.has([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers])
						) {
							targetPosition = role.position + 1;
							break;
						}
					}

					// Only set position if it's below the bot's highest role
					if (targetPosition < botHighestRole.position) {
						await newRole.setPosition(targetPosition);
					}
				} catch (positionError) {
					console.log('Could not set vanity role position, but role was created:', positionError.message);
					// Continue anyway - role was created successfully
				}

				// Assign the role to the user
				const member = await interaction.guild.members.fetch(userId);

				// Check if bot can assign the role (bot's role must be higher)
				if (newRole.position >= botHighestRole.position) {
					return interaction.followUp({
						content: `Your vanity role "${newRole.name}" has been created, but I cannot assign it to you because it's positioned at or above my highest role. Please ask a server admin to assign it to you!`,
					});
				}

				try {
					await member.roles.add(newRole);
					return interaction.followUp({ content: `Your vanity role "${newRole.name}" has been created and assigned to you!` });
				} catch (assignError) {
					console.error('Error assigning vanity role:', assignError);
					return interaction.followUp({
						content: `Your vanity role "${newRole.name}" has been created, but I was unable to assign it to you. Please ask a server admin to manually assign the role or ensure I have proper permissions.`,
					});
				}
			} catch (error) {
				console.error('Error creating vanity role:', error);
				return interaction.followUp({ content: 'There was an error creating your vanity role. Please ensure I have the necessary permissions.' });
			}
		} else if (subcommand === 'delete') {
			// Find the user's vanity role
			const roleToDelete = interaction.guild.roles.cache.find((role) => role.name === `${interaction.user.username}'s Vanity Role`);
			if (!roleToDelete) {
				return interaction.followUp({ content: 'You do not have a vanity role to delete.' });
			}

			try {
				// Remove the role from the user and delete it
				const member = await interaction.guild.members.fetch(userId);
				await member.roles.remove(roleToDelete);
				await roleToDelete.delete(`Vanity role deleted by ${interaction.user.tag}`);

				return interaction.followUp({ content: 'Your vanity role has been deleted.' });
			} catch (error) {
				console.error('Error deleting vanity role:', error);
				return interaction.followUp({ content: 'There was an error deleting your vanity role. Please ensure I have the necessary permissions.' });
			}
		}
	},
};
