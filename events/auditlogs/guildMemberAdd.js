const { Events, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	runType: 'infinity',
	async execute(client, member) {
		// Declarations
		const settings = await client.getGuild(member.guild);
		const oldInvites = client.invites.get(member.guild.id);
		let newInvites;
		let wasTooNew;

		// Fetch Invites
		if (member.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {
			newInvites = await member.guild.invites.fetch();
		} else {
			newInvites = null;
		}

		let usedInvite;
		if (newInvites && oldInvites) {
			usedInvite = newInvites.find((invite) => {
				const oldUses = oldInvites.get(invite.code)?.uses ?? 0;
				return invite.uses > oldUses;
			});
		}

		// Handle vanity URL
		let inviter = null;
		if (!usedInvite && member.guild.vanityURLCode) {
			usedInvite = { code: member.guild.vanityURLCode, inviter: null, isVanity: true };
		}

		// Fallback if no invite found
		if (!usedInvite) {
			usedInvite = { code: 'Unknown', inviter: null };
		}

		if (usedInvite?.inviter?.id) {
			try {
				inviter = await client.users.fetch(usedInvite.inviter.id);
			} catch (err) {
				console.error('Failed to fetch inviter:', err);
			}
		}
		if (!inviter) inviter = { id: null };

		// Update invite cache for next join
		if (newInvites) client.invites.set(member.guild.id, newInvites);

		// Checks
		if (member.id === client.user.id) return;
		if (!settings) return;

		// Kicking New Accounts
		if (settings.kickNewAccounts.enabled) {
			const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
			if (accountAgeDays < settings.kickNewAccounts.kickMaxAgeDays) {
				try {
					await member.send(
						`You have been kicked from **${member.guild.name}** because your account is too new (less than ${settings.kickNewAccounts.kickMaxAgeDays} days old).`
					);
				} catch (err) {
					console.error('Failed to send kick DM:', err);
				}
				await member.kick(`Account age less than ${settings.kickNewAccounts.kickMaxAgeDays} days.`);
				wasTooNew = true;
			}
		}

		// Check for Audit Channel to send logs to.
		const auditLogChannel = await member.guild.channels.cache.get(settings.auditLogId);
		if (auditLogChannel) {
			// If the user was too new, log it and return.
			if (wasTooNew) {
				const embed = new EmbedBuilder()
					.setColor(client.colors.vii)
					.setTitle('Member Kicked - New Account')
					.setThumbnail(member.displayAvatarURL())
					.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
					.setFooter({ text: `User ID: ${member.id}` })
					.addFields(
						{ name: 'Member Name', value: `<@${member.id}>`, inline: true },
						{ name: 'Account Created', value: client.relTimestamp(member.user.createdTimestamp), inline: true },
						{ name: 'Action', value: 'Kicked for being a new account', inline: true }
					);
				return await auditLogChannel.send({ embeds: [embed] });
			}

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Member Joined')
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.setFooter({ text: `User ID: ${member.id}` })
				.addFields(
					{ name: 'Member Name', value: `<@${member.id}>`, inline: true },
					{ name: 'Joined', value: client.relTimestamp(Date.now()), inline: true },
					{ name: 'Invite Used', value: usedInvite.code, inline: true },
					{ name: 'Inviter', value: inviter.id ? `<@${inviter.id}>` : 'Unknown', inline: true }
				);

			// Send message
			await auditLogChannel.send({ embeds: [embed] });
		}

		// Check for a Welcome Channel to send arrival message to.
		const welcomeChannel = await member.guild.channels.cache.get(settings.welcomeChannelId);
		if (welcomeChannel) {
			// Fetch Welcome Text
			const welcomeText = settings.welcomeMessage;
			const welcomeMessage = welcomeText.replace('{SERVER_NAME}', member.guild.name).replace('{USER_NAME}', member.displayName).replace('{USER_MENTION}', member);

			// Build Embed
			const embed = new EmbedBuilder().setAuthor({ iconURL: member.displayAvatarURL(), name: member.displayName }).setColor(client.colors.vii).setDescription(welcomeMessage);

			if (settings.welcomeImage) {
				embed.setImage(settings.welcomeImage);
			} else {
				embed.setThumbnail(member.displayAvatarURL());
				embed.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');
			}

			if (inviter.id) {
				embed.setFooter({ text: `Invited by: ${inviter.displayName}`, iconURL: inviter.displayAvatarURL() });
			}

			// Send message
			await welcomeChannel.send({ embeds: [embed] });
		}

		// Verification System
		if (!settings.verificationChannelId) return;
		// Check for Verification Channel
		const verificationChannel = await member.guild.channels.cache.get(settings.verificationChannelId);
		if (!verificationChannel && auditLogChannel) {
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Verification Channel Not Found')
				.setDescription('The verification channel was not found. Please set it with the `/configure` command.');
			return await auditLogChannel.send({ embeds: [embed] });
		} else if (!verificationChannel) {
			return;
		}

		// Check for Verified Role
		const verifiedRole = member.guild.roles.cache.get(settings.verifiedRoleId);
		if (!verifiedRole && auditLogChannel) {
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Verified Role Not Found')
				.setDescription('The verified role was not found. Please set it with the `/configure` command.');
			return await auditLogChannel.send({ embeds: [embed] });
		} else if (!verifiedRole) {
			return;
		}

		// Create Verification Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Verification Request')
			.setDescription(`${member} has joined the server.\nPlease confirm or deny their entry by clicking the buttons below.`);

		// Create Buttons
		const verificationButtons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setLabel('Confirm').setStyle(ButtonStyle.Success).setCustomId(`verify_${member.id}`),
			new ButtonBuilder().setLabel('Deny').setStyle(ButtonStyle.Danger).setCustomId(`deny_${member.id}`)
		);

		// Send Message
		await verificationChannel.send({ embeds: [embed], components: [verificationButtons] });
	},
};
