const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { autoChannelData } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avoice')
		.setDescription('Manage the auto voice channel system.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('create')
				.setDescription('Set up the creator channel for this category.')
				.addChannelOption((option) =>
					option.setName('category').setDescription('The category to set the creator channel to').addChannelTypes(ChannelType.GuildCategory).setRequired(true)
				)
				.addStringOption((option) => option.setName('master_channel_name').setDescription('Name of the master channel').setRequired(false))
				.addStringOption((option) => option.setName('child_default_name').setDescription('Default name of child channels. Template: {USER}').setRequired(false))
				.addNumberOption((option) =>
					option.setName('child_default_max_users').setDescription('Default max users for the child channels').setMinValue(0).setMaxValue(99).setRequired(false)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('delete')
				.setDescription('Delete a specific creator channel.')
				.addChannelOption((option) =>
					option.setName('master_channel').setDescription('The master channel to delete').addChannelTypes(ChannelType.GuildVoice).setRequired(true)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('edit_child_name')
				.setDescription('Edit the default name of the child channels.')
				.addChannelOption((option) =>
					option.setName('master_channel').setDescription('The master channel to edit the child name for').addChannelTypes(ChannelType.GuildVoice).setRequired(true)
				)
				.addStringOption((option) => option.setName('child_default_name').setDescription('Default name of child channels. Template: {USER}').setRequired(true))
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

		// switch subGroup
		switch (subCommand) {
			case 'create':
				// Get the category channel
				const masterCategory = interaction.options.getChannel('category');
				const masterName = interaction.options.getString('master_channel_name');

				// No check needed - allow multiple master channels per category

				// Create the master channel
				const childDefaultName = interaction.options.getString('child_default_name');
				const childDefaultMaxUsers = interaction.options.getNumber('child_default_max_users');

				// Create voice channel
				let masterChannelCreate = await interaction.guild.channels.create({
					name: masterName || '➕ Join to Create',
					type: ChannelType.GuildVoice,
					parent: masterCategory,
				});

				// Dont audit the channel creation
				masterChannelCreate.shouldAudit = false;

				// Save data to the database
				await autoChannelData
					.findOneAndUpdate(
						{ guildId: interaction.guild.id },
						{
							guildId: interaction.guild.id,
							$addToSet: {
								masterChannels: {
									masterCategoryId: masterCategory.id,
									masterChannelId: masterChannelCreate.id,
									childDefaultName: childDefaultName || "{USER}'s VC",
									childDefaultMaxUsers: childDefaultMaxUsers || 0,
									childChannels: [],
								},
							},
						},
						{ upsert: true }
					)
					.then(() => {
						interaction.followUp({ content: `The master channel has been created for ${masterCategory.name}` });
					});
				break;
			case 'delete':
				// Get the master channel
				const masterChannelToDelete = interaction.options.getChannel('master_channel');

				// Check if this is a master channel
				const check = await autoChannelData.findOne({ guildId: interaction.guild.id, 'masterChannels.masterChannelId': masterChannelToDelete.id });
				if (!check) return interaction.followUp({ content: 'This channel is not set up as a master channel.' });

				// Find the specific master channel data
				const masterData = check.masterChannels.find((mc) => mc.masterChannelId === masterChannelToDelete.id);
				if (!masterData) return interaction.followUp({ content: 'Master channel data not found.' });

				// Delete all child channels first
				for (const childChannel of masterData.childChannels) {
					if (childChannel?.childId) {
						try {
							const ch = await interaction.guild.channels.fetch(childChannel.childId);
							if (ch) await ch.delete();
						} catch (error) {}
					}
				}

				// Delete the master voice channel
				try {
					const masterChannel = await interaction.guild.channels.fetch(masterChannelToDelete.id);
					if (masterChannel) {
						masterChannel.shouldAudit = false;
						await masterChannel.delete();
					}
				} catch (error) {}

				// Remove from database
				await autoChannelData.findOneAndUpdate(
					{ guildId: interaction.guild.id },
					{ $pull: { masterChannels: { masterChannelId: masterChannelToDelete.id } } }
				);

				interaction.followUp({ content: `The master channel **${masterChannelToDelete.name}** and its child channels have been deleted.` });
				break;
			case 'edit_child_name':
				// Get the master channel
				const masterChannelToEdit = interaction.options.getChannel('master_channel');
				const childEditedName = interaction.options.getString('child_default_name');

				// Check if this is a master channel
				const checkData = await autoChannelData.findOne({ guildId: interaction.guild.id, 'masterChannels.masterChannelId': masterChannelToEdit.id });
				if (!checkData) return interaction.followUp({ content: 'This channel is not set up as a master channel.' });

				// Update the child default name for the specific master channel
				await autoChannelData.findOneAndUpdate(
					{ guildId: interaction.guild.id, 'masterChannels.masterChannelId': masterChannelToEdit.id },
					{ $set: { 'masterChannels.$.childDefaultName': childEditedName } }
				);

				interaction.followUp({ content: `The child default name has been set to **${childEditedName}** for master channel **${masterChannelToEdit.name}**` });
				break;
		}
	},
};
