const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.GuildMemberRemove,
	runType: 'infinity',
	async execute(client, member) {
		// Declarations
		const settings = await client.getGuild(member.guild);

		// Checks
		if (member.id === client.user.id) return;
		if (!settings) return;

		// Check for Audit Channel to send logs to.
		const auditLogChannel = await member.guild.channels.cache.get(settings.auditLogId);
		if (auditLogChannel) {
			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Member Left')
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Member Name', value: member.displayName, inline: true },
					{ name: 'Left', value: client.relTimestamp(Date.now()), inline: true }
				);

			// Send message
			await auditLogChannel.send({ embeds: [embed] });
		}

		// Check for a Leave Channel to send departure message to.
		const leaveChannel = await member.guild.channels.cache.get(settings.leaveChannelId);
		if (leaveChannel) {

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle(member.displayName)
				.setDescription(`${member.displayName} has left the server.`)
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Send message
			await leaveChannel.send({ embeds: [embed] });
		}
	},
};
