const { Events, PermissionsBitField, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		// Only handle button clicks and modal submissions here
		if (!interaction.isButton() && !interaction.isModalSubmit()) return;

		// Common declarations
		const staffMember = interaction.member;
		if (!staffMember || !staffMember.permissions.has(PermissionFlagsBits.ManageRoles)) return;

		// Fetch guild settings early (used for audit logging)
		const settings = await client.getGuild(interaction.guild);

		// Check bot permissions (log if missing)
		if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles) && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
			if (settings && settings.auditLogId) {
				const auditLog = interaction.guild.channels.cache.get(settings.auditLogId);
				const embed = new EmbedBuilder()
					.setTitle('Missing Permissions')
					.setDescription(`I need the **Manage Roles** and **Kick Members** permission to verify or deny members.`)
					.setColor(client.colors.error)
					.setTimestamp();
				auditLog?.send({ embeds: [embed] });
			} else {
				try {
					await staffMember.send('I need the **Manage Roles** and **Kick Members** permission to verify or deny members.');
				} catch (error) {
					console.error(error);
				}
			}
		}

		// Modal and Button Handling
		if (interaction.isButton() || interaction.isModalSubmit()) {
			let staffMember = interaction.member;
			let action, userId;
			let settings, verifiedRole, member;
			if (interaction.isButton()) {
				[action, userId] = interaction.customId.split('_');
				if (action !== 'verify' && action !== 'denyreason') return;
				if (!staffMember.permissions.has(PermissionFlagsBits.ManageRoles)) return;
				settings = await client.getGuild(interaction.guild);
				verifiedRole = interaction.guild.roles.cache.get(settings.verifiedRoleId);
				member = interaction.guild.members.cache.get(userId);
				if (!member) return;
				if (action === 'verify') {
					if (interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
						await member.roles.add(verifiedRole);
						await interaction.update({
							embeds: [
								new EmbedBuilder().setColor(client.colors.success).setTitle('Member Verified').setDescription(`${member} has been verified by ${staffMember}.`).setTimestamp(),
							],
							components: [],
						});
					}
				} else if (action === 'denyreason') {
					// Show modal for denial reason
					const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
					const origMsg = interaction.message;
					const modal = new ModalBuilder()
						// include userId, original message id, and channel id so we can edit the original message on submit
						.setCustomId(`deny_modal_${userId}_${origMsg.id}_${origMsg.channel.id}`)
						.setTitle('Deny Member - Reason');
					const reasonInput = new TextInputBuilder()
						.setCustomId('deny_reason')
						.setLabel('Reason for denial')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Enter the reason the user should be denied (required)')
						.setRequired(true)
						.setMaxLength(1000);
					modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
					return await interaction.showModal(modal);
				}
			} else if (interaction.isModalSubmit()) {
				// customId format: deny_modal_<userId>_<messageId>_<channelId>
				const parts = interaction.customId.split('_');
				const actionPart = parts[0];
				if (actionPart !== 'deny') return;
				const userIdPart = parts[2];
				const messageIdPart = parts[3];
				const channelIdPart = parts[4];
				settings = await client.getGuild(interaction.guild);
				// resolve member, fetch if necessary
				member = interaction.guild.members.cache.get(userIdPart) || null;
				if (!member) {
					try {
						member = await interaction.guild.members.fetch(userIdPart);
					} catch (err) {
						console.error('Failed to fetch member to deny:', err);
						await interaction.reply({ content: 'Could not find the member to deny.', flags: MessageFlags.Ephemeral });
						return;
					}
				}
				const reason = interaction.fields.getTextInputValue('deny_reason');
				// Kick member with reason
				let dmFailed = false;
				if (interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
					try {
						await member.send(`You have been denied entry to **${interaction.guild.name}**. Reason: ${reason}`);
					} catch (err) {
						console.error(`Could not send DM to ${member.user.tag}. They might have DMs disabled.`);
						dmFailed = true;
					}
					try {
						await member.kick(`Denied by ${staffMember.displayName}: ${reason}`);
					} catch (err) {
						console.error('Failed to kick member:', err);
					}
				}

				// Edit the original verification message (remove buttons, show denial)
				try {
					const verificationChannel =
						interaction.guild.channels.cache.get(channelIdPart) ||
						interaction.channel ||
						(settings && settings.verificationChannelId ? interaction.guild.channels.cache.get(settings.verificationChannelId) : null);
					if (verificationChannel && messageIdPart) {
						try {
							const origMessage = await verificationChannel.messages.fetch(messageIdPart);
							const deniedEmbed = new EmbedBuilder()
								.setColor(client.colors.error)
								.setTitle('Member Denied')
								.setDescription(`<@${userIdPart}> has been denied by ${staffMember}.\nReason: ${reason}`)
								.setTimestamp();
							await origMessage.edit({ embeds: [deniedEmbed], components: [] });
						} catch (err) {
							console.error('Failed to fetch or edit original verification message:', err);
						}
					}
				} catch (err) {
					console.error('Error editing original verification message:', err);
				}

				// Log in audit channel
				if (settings.auditLogId) {
					const auditLog = interaction.guild.channels.cache.get(settings.auditLogId);
					const embed = new EmbedBuilder()
						.setColor(client.colors.error)
						.setTitle('Member Denied')
						.setDescription(`${member} was denied by ${staffMember}.\nReason: ${reason}`)
						.setTimestamp();
					await auditLog.send({ embeds: [embed] });
				}

				// Reply to modal (always reply once)
				const replyContent = `Member denied and kicked.${dmFailed ? ' Could not DM the user.' : ''}`;
				await interaction.reply({ content: replyContent, flags: MessageFlags.Ephemeral });
			}
		} else {
			await interaction.reply({ content: `Missing Kick Members permission.`, flags: MessageFlags.Ephemeral });
		}
	},
};
