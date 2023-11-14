const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
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
				.setTitle('Member Joined')
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
				.addFields(
					{ name: 'Member Name', value: member.displayName, inline: true },
					{ name: 'Joined', value: client.relTimestamp(Date.now()), inline: true }
				);

			// Send message
			await auditLogChannel.send({ embeds: [embed] });
		}

		// Check for a Welcome Channel to send arrival message to.
		const welcomeChannel = await member.guild.channels.cache.get(settings.welcomeChannelId);
		if (welcomeChannel) {
			// Fetch Welcome Text
			const welcomeText = settings.welcomeMessage;
			const welcomeMessage = welcomeText.replace('{SERVER_NAME}', member.guild.name).replace('{USER_NAME}', member.displayName);

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle(member.displayName)
				.setDescription(welcomeMessage)
				.setThumbnail(member.displayAvatarURL())
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Send message
			await welcomeChannel.send({ embeds: [embed] });
		}
	},
};
