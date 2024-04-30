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
				.addStringOption((option) => option.setName('master_category_name').setDescription('Name of the master channel').setRequired(false))
				.addStringOption((option) => option.setName('child_default_name').setDescription('Default name of child channels. Template: {USER}').setRequired(false))
				.addNumberOption((option) =>
					option.setName('child_default_max_users').setDescription('Default max users for the child channels').setMinValue(0).setMaxValue(99).setRequired(false)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('delete')
				.setDescription('Delete the creator channel for this category.')
				.addChannelOption((option) =>
					option.setName('category').setDescription('The category to delete the master channel from').addChannelTypes(ChannelType.GuildCategory).setRequired(true)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('edit_child_name')
				.setDescription('Edit the default name of the child channels.')
				.addChannelOption((option) =>
					option.setName('category').setDescription('The category to edit the child name for').addChannelTypes(ChannelType.GuildCategory).setRequired(true)
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
				const masterName = interaction.options.getString('master_category_name');

				// Check if the category is already set up
				const masterCheck = await autoChannelData.findOne({ guildId: interaction.guild.id, 'masterChannels.masterCategoryId': masterCategory.id });
				if (masterCheck) return interaction.followUp({ content: 'The category is already set up.' });

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
				// Get the category channel
				const masterId = interaction.options.getChannel('category');

				// Check if the category is already set up
				const check = await autoChannelData.findOne({ guildId: interaction.guild.id, 'masterChannels.masterCategoryId': masterId.id });
				if (!check) return interaction.followUp({ content: 'The category is not set up.' });

				// Delete the voice channel by id
				const masterChannel = await interaction.guild.channels.cache.get(check.masterChannels[0].masterChannelId).delete();

				// Dont audit the channel deletion
				masterChannel.shouldAudit = false;

				// Delete the master channel
				await autoChannelData.findOneAndUpdate({ guildId: interaction.guild.id }, { $pull: { masterChannels: { masterCategoryId: masterId.id } } }).then(() => {
					interaction.followUp({ content: `The master channel has been deleted for ${masterId.name}` });
				});
				break;
			case 'edit_child_name':
				// Get the category channel
				const categoryId = interaction.options.getChannel('category');
				const childEditedName = interaction.options.getString('child_default_name');

				// Check if the category is already set up
				const checkData = await autoChannelData.findOne({ guildId: interaction.guild.id, 'masterChannels.masterCategoryId': categoryId.id });
				if (!checkData) return interaction.followUp({ content: 'The category is not set up.' });

				// Update the child default name
				await autoChannelData.findOneAndUpdate(
					{ guildId: interaction.guild.id, 'masterChannels.masterCategoryId': categoryId.id },
					{ $set: { 'masterChannels.$.childDefaultName': childEditedName } }
				);

				interaction.followUp({ content: `The child default name has been set to **${childEditedName}** for ${categoryId.name}` });
				break;
		}
	},
};
