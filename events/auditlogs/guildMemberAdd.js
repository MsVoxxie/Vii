const { Events, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
		const inviter = await client.users.fetch(usedInvite?.inviter.id);

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
	},
};
