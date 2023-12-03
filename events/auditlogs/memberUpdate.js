const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.GuildMemberUpdate,
	runType: 'infinity',
	async execute(client, oldMember, newMember) {
		// Checks
		if (oldMember === newMember) return;

		// Get guild settings
		const settings = await client.getGuild(oldMember.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await oldMember.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Declarations
		const oldAvatar = oldMember.displayAvatarURL();
		const newAvatar = newMember.displayAvatarURL();

		// Create Embed
		const embed = new EmbedBuilder()
			.setTitle('Member Updated')
			.setColor(client.colors.vii)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(`**Member:** ${oldMember.displayName}\n**Updated:** ${client.relTimestamp(Date.now())}`)
			.setThumbnail(oldAvatar);

		// Avatar
		if (oldAvatar !== newAvatar) {
			embed.addFields({ name: 'Avatar', value: `[**[Before]**](${oldAvatar}) **›** [**[After]**](${newAvatar})`, inline: false });
		}

		// Username
		if (oldMember.user.username !== newMember.user.username) {
			embed.addFields({ name: 'Username', value: `${oldMember.user.username} **›** ${newMember.user.username}`, inline: false });
		}

		// Nickname
		if (oldMember.nickname !== newMember.nickname) {
			embed.addFields({
				name: 'Nickname',
				value: `${oldMember.nickname === null ? `${oldMember.displayName}` : oldMember.nickname} **›** ${
					newMember.nickname === null ? `${newMember.displayName}` : newMember.nickname
				}`,
				inline: false,
			});
		}

		// Roles
		let removedRoles = [];
		let addedRoles = [];

		oldMember.roles.cache.forEach((role) => {
			if (!newMember.roles.cache.has(role.id)) {
				removedRoles.push(role);
			}
		});

		newMember.roles.cache.forEach((role) => {
			if (!oldMember.roles.cache.has(role.id)) {
				addedRoles.push(role);
			}
		});

		if (oldMember.roles.cache.size > newMember.roles.cache.size) {
			embed.addFields({
				name: 'Removed Roles',
				value: removedRoles.map((p) => p).join(', '),
				inline: false,
			});
		}

		if (oldMember.roles.cache.size < newMember.roles.cache.size) {
			embed.addFields({
				name: 'Added Roles',
				value: addedRoles.map((p) => p).join(', '),
				inline: false,
			});
		}

		// Send Message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
