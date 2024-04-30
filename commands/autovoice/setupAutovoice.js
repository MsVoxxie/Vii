const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { autoChannelData } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avoice')
		.setDescription('Manage the auto voice channel system.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('setup')
				.setDescription('Set up the auto voice channel system in a category.')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('creator')
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
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('delete')
				.setDescription('Delete the auto voice channel system from a category.')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('creator')
						.setDescription('Delete the creator channel for this category.')
						.addChannelOption((option) =>
							option.setName('category').setDescription('The category to delete the master channel from').addChannelTypes(ChannelType.GuildCategory).setRequired(true)
						)
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
		const subGroup = interaction.options.getSubcommandGroup();
		const subCommand = interaction.options.getSubcommand();

		// switch subGroup
		switch (subGroup) {
			case 'setup':
				if (subCommand === 'creator') {
					// Get the category channel
					const masterId = interaction.options.getChannel('category');
					const masterName = interaction.options.getString('master_category_name');

					// Get the guildId
					const guildId = interaction.guild.id;

					// Check if the category is already set up
					const check = await autoChannelData.findOne({ guildId, 'masterChannels.masterCategoryId': masterId.id });
					if (check) return interaction.followUp({ content: 'The category is already set up.' });

					// Create the master channel
					const childDefaultName = interaction.options.getString('child_default_name');
					const childDefaultMaxUsers = interaction.options.getNumber('child_default_max_users');

					// Create voice channel
					let masterChannel = await interaction.guild.channels.create({
						name: masterName || '➕ Join to Create',
						type: ChannelType.GuildVoice,
						parent: masterId,
					});

					// Save data to the database
					await autoChannelData
						.findOneAndUpdate(
							{ guildId },
							{
								guildId,
								$addToSet: {
									masterChannels: {
										masterCategoryId: masterId.id,
										masterChannelId: masterChannel.id,
										childDefaultName: childDefaultName || "{USER}'s VC",
										childDefaultMaxUsers: childDefaultMaxUsers || 0,
										childChannels: [],
									},
								},
							},
							{ upsert: true }
						)
						.then(() => {
							interaction.followUp({ content: `The master channel has been created for ${masterId.name}` });
						});
				}
				break;

			case 'delete':
				if (subCommand === 'creator') {
					// Get the category channel
					const masterId = interaction.options.getChannel('category');
					// Get the guildId
					const guildId = interaction.guild.id;

					// Check if the category is already set up
					const check = await autoChannelData.findOne({ guildId, 'masterChannels.masterCategoryId': masterId.id });
					if (!check) return interaction.followUp({ content: 'The category is not set up.' });

					// Delete the voice channel by id
					await interaction.guild.channels.cache.get(check.masterChannels[0].masterChannelId).delete();

					// Delete the master channel
					await autoChannelData.findOneAndUpdate({ guildId }, { $pull: { masterChannels: { masterCategoryId: masterId.id } } }).then(() => {
						interaction.followUp({ content: `The master channel has been deleted for ${masterId.name}` });
					});
				}
				break;
		}
	},
};
