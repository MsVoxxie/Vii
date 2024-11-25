const { Events, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	runType: 'infinity',
	async execute(client, member) {
		// Declarations
		const settings = await client.getGuild(member.guild);
		const oldInvites = client.invites.get(member.guild.id);
		let newInvites;

		// Fetch Invites
		if (member.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {
			newInvites = await member.guild.invites.fetch();
		}

		// Invite information
		const usedInvite = newInvites?.find((invite) => invite.uses > oldInvites.get(invite.code));
		const inviter = await client.users?.fetch(usedInvite?.inviter.id);

		// Checks
		if (member.id === client.user.id) return;
		if (!settings) return;

		// Check for Audit Channel to send logs to.
		const auditLogChannel = await member.guild.channels.cache.get(settings.auditLogId);
		if (auditLogChannel) {
			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Member Joined')
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
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
