const { Events, EmbedBuilder, MessageFlags, codeBlock } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		if (!interaction.isButton()) return;

		// Declarations
		const buttonId = interaction.customId;
		if (buttonId !== 'get_invite') return;

		// Fetch guild settings
		const settings = await client.getGuild(interaction.guild);
		const inviteChannel = interaction.guild.channels.cache.get(settings.inviteChannelId);
		if (!inviteChannel) return interaction.followUp('Invite channel not found.');

		const invite = await interaction.channel.createInvite({
			maxUses: settings.inviteMaxUses,
			maxAge: settings.inviteMaxAge,
			reason: `Created by ${interaction.user.id}`,
			unique: true,
		});

		// Generate embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.success)
			.setTitle('Requested Invite Link')
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.setDescription(`Here is your invite link for **${interaction.guild.name}** ${codeBlock(`${invite.url}`)}`)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();

		// Send the invite link to the user directly
		try {
			await interaction.user.send({ embeds: [embed] });
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error('Error sending invite link:', error);
		}
	},
};
