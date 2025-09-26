const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { Guild } = require('../../models/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('starboard')
		.setDescription('Configure the starboard for your server')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('configure')
				.setDescription('Set the starboard channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the starboard channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the starboard channel to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the starboard channel'))
				.addSubcommand((subCommand) =>
					subCommand
						.setName('starmoji')
						.setDescription('Set the starboard react emoji')
						.addStringOption((option) => option.setName('emoji').setDescription('The emoji which starboard will use.').setRequired(true))
				)
				.addSubcommand((subCommand) =>
					subCommand
						.setName('starcount')
						.setDescription('Set the starboard react emoji')
						.addNumberOption((option) => option.setName('count').setDescription('How many stars for a post to be pinned').setMinValue(1).setMaxValue(99).setRequired(true))
				)
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
			// Starboard channel
			case 'configure':
				if (subCommand === 'setchannel') {
					// Get channel
					const starboardChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!starboardChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set level channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { starboardChannelId: starboardChannel.id });
					// Follow up
					interaction.followUp(`Starboard channel set to ${starboardChannel}`);
				}
				if (subCommand === 'removechannel') {
					// Remove level channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { starboardChannelId: null });
					// Follow up
					interaction.followUp('Starboard channel removed');
				}
				if (subCommand === 'starmoji') {
					// Get Emoji
					const starboardEmoji = interaction.options.getString('emoji');
					const emojiTest = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
					if (emojiTest.test(starboardEmoji) === false)
						return interaction.followUp({ content: 'The emoji you provided is not a valid emoji.', flags: MessageFlags.Ephemeral });
					// Set Starboard Emoji
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { starboardEmoji: starboardEmoji });
					// Follow up
					interaction.followUp(`Starboard emoji set to ${starboardEmoji}`);
				}
				if (subCommand === 'starcount') {
					// Get Count
					const starCount = interaction.options.getNumber('count');
					// Set Starboard Count
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { starboardLimit: starCount });
					// Followup
					interaction.followUp(`Starboard star limit set to ${starCount}`);
				}
				break;
		}
	},
};
