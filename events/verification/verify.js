const { Events, PermissionsBitField, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		if (!interaction.isButton()) return console.log('Not a button.');

		// Declarations
		const staffMember = interaction.member;
		const message = interaction.message;
		const [action, userId] = interaction.customId.split('_');
		if (action !== 'verify' && action !== 'deny') return;

		// Check if the staff member has the manage_members permission
		if (!staffMember.permissions.has(PermissionFlagsBits.ManageRoles)) return;

		// Fetch guild settings
		const settings = await client.getGuild(interaction.guild);
		const verifiedRole = interaction.guild.roles.cache.get(settings.verifiedRoleId);
		const member = interaction.guild.members.cache.get(userId);

		// Check if the member is already verified
		if (member.roles.cache.has(verifiedRole.id)) return;

		// Prepare confirmation embed
		const confirmEmbed = new EmbedBuilder().setColor(client.colors.success).setTimestamp();

		// Verify or deny the member
		switch (action) {
			case 'verify':
				// Check if I have the permissions to add the role
				if (interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
					await member.roles.add(verifiedRole);
					confirmEmbed.setTitle('Member Verified');
					confirmEmbed.setDescription(`${member} has been verified by ${staffMember}.`);
					await message.edit({ embeds: [confirmEmbed], components: [] });
				} else {
					if (settings.auditLogId) {
						const auditLog = interaction.guild.channels.cache.get(settings.auditLogId);
						const embed = new EmbedBuilder()
							.setTitle('Missing Permissions')
							.setDescription(`I need the **Manage Roles** permission to verify members.`)
							.setColor(client.colors.error)
							.setTimestamp();
						return await auditLog.send({ embeds: [embed] });
					}
				}
				break;
			case 'deny':
				// Check if I have the permissions to kick the member
				if (interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
					await member.kick();
					confirmEmbed.setTitle('Member Denied');
					confirmEmbed.setDescription(`${member} has been denied by ${staffMember}.`);
					await message.edit({ embeds: [confirmEmbed], components: [] });
				} else {
					if (settings.auditLogId) {
						const auditLog = interaction.guild.channels.cache.get(settings.auditLogId);
						const embed = new EmbedBuilder()
							.setTitle('Missing Permissions')
							.setDescription(`I need the **Kick Members** permission to deny members.`)
							.setColor(client.colors.error)
							.setTimestamp();
						return await auditLog.send({ embeds: [embed] });
					}
				}
				break;
		}

		console.log(action, userId);
	},
};
