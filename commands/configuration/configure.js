const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
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
				.setName('verificationchannel')
				.setDescription('Configure the verification channel')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setchannel')
						.setDescription('Set the verification channel')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the verification channel to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removechannel').setDescription('Remove the verification channel'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('invite_config')
				.setDescription('Configure the invite system')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setup')
						.setDescription('Setup the invite system')
						.addChannelOption((option) => option.setName('channel').setDescription('The channel to set the invite system to').setRequired(true))
						.addStringOption((option) => option.setName('embed_message').setDescription('The message to send in the invite system embed').setRequired(true))
						.addStringOption((option) =>
							option
								.setName('invite_max_uses')
								.setDescription('The max uses for the invite link')
								.setRequired(true)
								.addChoices(
									{ name: '1 Use', value: '1' },
									{ name: '5 Uses', value: '5' },
									{ name: '10 Uses', value: '10' },
									{ name: '25 Uses', value: '25' },
									{ name: '50 Uses', value: '50' },
									{ name: '100 Uses', value: '100' }
								)
						)
						.addStringOption((option) =>
							option
								.setName('invite_max_age')
								.setDescription('The max age for the invite link')
								.setRequired(true)
								.addChoices(
									{ name: '1 Hour', value: '3600' },
									{ name: '6 Hours', value: '21600' },
									{ name: '12 Hours', value: '43200' },
									{ name: '1 Day', value: '86400' },
									{ name: '7 Days', value: '604800' },
									{ name: 'Never Expire', value: '0' }
								)
						)
				)
				.addSubcommand((subCommand) => subCommand.setName('remove').setDescription('Remove the invite system'))
		)
		.addSubcommandGroup((subGroup) =>
			subGroup
				.setName('verifiedrole')
				.setDescription('Configure the verified role')
				.addSubcommand((subCommand) =>
					subCommand
						.setName('setrole')
						.setDescription('Set the verified role')
						.addRoleOption((option) => option.setName('role').setDescription('The role to set the verified role to').setRequired(true))
				)
				.addSubcommand((subCommand) => subCommand.setName('removerole').setDescription('Remove the verified role'))
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
			// Verification channel
			case 'verificationchannel':
				if (subCommand === 'setchannel') {
					// Get channel
					const verificationChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!verificationChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Set verification channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { verificationChannelId: verificationChannel.id });
					// Follow up
					interaction.followUp(`Verification channel set to ${verificationChannel}`);
				} else if (subCommand === 'removechannel') {
					// Remove verification channel
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { verificationChannelId: null });
					// Follow up
					interaction.followUp('Verification channel removed');
				}
				break;
			// Verified role
			case 'verifiedrole':
				if (subCommand === 'setrole') {
					// Get role
					const verifiedRole = interaction.options.getRole('role');
					// Set verified role
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { verifiedRoleId: verifiedRole.id });
					// Follow up
					interaction.followUp(`Verified role set to ${verifiedRole}`);
				} else if (subCommand === 'removerole') {
					// Remove verified role
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { verifiedRoleId: null });
					// Follow up
					interaction.followUp('Verified role removed');
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

			// Invite system
			case 'invite_config':
				if (subCommand === 'setup') {
					// Get channel
					const inviteChannel = interaction.options.getChannel('channel');
					// Make sure channel is a text channel
					if (!inviteChannel.isTextBased()) return interaction.followUp('Channel must be a text channel');
					// Get embed message
					const embedMessage = interaction.options.getString('embed_message');
					// Get max uses
					const maxUses = interaction.options.getString('invite_max_uses');
					// Get max age
					const maxAge = interaction.options.getString('invite_max_age');

					// Confirmation message
					const confirmEmbed = new EmbedBuilder()
						.setColor('Green')
						.setTitle('Invite System Setup')
						.setDescription(
							`Invite system setup in ${inviteChannel} with the following settings:\n\n**Embed Message:** ${embedMessage}\n**Max Uses:** ${maxUses}\n**Max Age:** ${maxAge}`
						);

					// Create the Invite Embed and Button
					const inviteEmbed = new EmbedBuilder()
						.setColor(client.colors.vii)
						.setDescription(embedMessage)
						.setFooter({ text: 'Click the button below to get your invite link!' });
					const invButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('get_invite').setLabel('Get Invite Link').setStyle(ButtonStyle.Success));

					try {
						// Send the invite embed
						const inviteMessage = await inviteChannel.send({ embeds: [inviteEmbed], components: [invButton] });

						// Set invite system
						await Guild.findOneAndUpdate(
							{ guildId: interaction.guild.id },
							{
								inviteChannelId: inviteChannel.id,
								inviteEmbedId: inviteMessage.id,
								inviteMaxUses: maxUses,
								inviteMaxAge: maxAge,
							}
						);

						// Send confirmation message
						await interaction.followUp({ embeds: [confirmEmbed] });
					} catch (error) {
						console.error('Error sending invite embed:', error);
						await interaction.followUp('There was an error setting up the invite system. Please try again.');
					}
				}

				// Remove invite system
				if (subCommand === 'remove') {
					// Get the invite channel from the database
					const settings = await client.getGuild(interaction.guild);
					const inviteChannelId = settings.inviteChannelId;
					const inviteMessageId = settings.inviteEmbedId;
					let errMsg;

					// Try to fetch the channel and message
					try {
						const inviteChannel = await interaction.guild.channels.fetch(inviteChannelId);
						const inviteMessage = await inviteChannel.messages.fetch(inviteMessageId);

						// Delete the message
						await inviteMessage.delete();
					} catch (error) {
						console.error('Error deleting invite message:', error);
						errMsg = 'There was an error deleting the invite message.';
					}

					// Remove invite system
					await Guild.findOneAndUpdate({ guildId: interaction.guild.id }, { inviteChannelId: null, inviteMaxUses: null, inviteMaxAge: null });
					// Follow up
					interaction.followUp({ content: `Invite system removed${errMsg ? `\nHowever, ${errMsg}` : ''}`, flags: MessageFlags.Ephemeral });
				}
				break;
		}
	},
};
// Invite button idea
// Generate an embed with a configurable message, invite uses and, duration.

// Will make a button which users can click,

// Clicking the button will dm them an invite link for the server
