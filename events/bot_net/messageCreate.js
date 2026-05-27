const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		if (!message.inGuild()) return;
		if (!message.channel) return;
		if (message.author.id === client.user.id) return;

		const settings = await client.getGuild(message.guild);
		if (!settings?.botNetChannelId) return;
		if (message.channel.id !== settings.botNetChannelId) return;

		const botMember = message.guild.members.me;
		if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) {
			console.error(`Missing Ban Members permission for bot-net enforcement in guild ${message.guild.id}`);
			return;
		}

		const member = message.member || (await message.guild.members.fetch(message.author.id).catch(() => null));
		if (!member) return;

		const isExempt = member.permissions.has([
			PermissionFlagsBits.Administrator,
			PermissionFlagsBits.ManageGuild,
			PermissionFlagsBits.ManageChannels,
			PermissionFlagsBits.ManageMessages,
			PermissionFlagsBits.ModerateMembers,
			PermissionFlagsBits.KickMembers,
			PermissionFlagsBits.BanMembers,
		]);

		if (isExempt) {
			try {
				await message.delete();
			} catch (error) {
				console.error('Failed to delete exempt user message in bot-net channel:', error);
			}

			const auditLogChannel = settings.auditLogId ? message.guild.channels.cache.get(settings.auditLogId) : null;
			if (!auditLogChannel?.isTextBased()) return;

			const exemptEmbed = new EmbedBuilder()
				.setColor(client.colors.warning)
				.setTitle('Bot-Net Trap Triggered (Exempt User)')
				.setDescription('An exempt member posted in the bot-net trap channel. Their message was deleted, but they were not banned.')
				.addFields({ name: 'Member', value: `<@${message.author.id}>`, inline: true }, { name: 'Channel', value: `<#${message.channel.id}>`, inline: true })
				.setFooter({ text: `User ID: ${message.author.id}` });

			try {
				await auditLogChannel.send({ embeds: [exemptEmbed] });
			} catch (error) {
				console.error('Failed to send exempt bot-net audit log:', error);
			}
			return;
		}

		try {
			await message.guild.members.ban(message.author.id, {
				reason: 'Triggered bot-net trap channel.',
				deleteMessageSeconds: 86400,
			});
		} catch (error) {
			console.error('Failed to ban user from bot-net trap channel:', error);
			return;
		}

		const auditLogChannel = settings.auditLogId ? message.guild.channels.cache.get(settings.auditLogId) : null;
		if (!auditLogChannel?.isTextBased()) return;

		const embed = new EmbedBuilder()
			.setColor(client.colors.error)
			.setTitle('Bot-Net Trap Triggered')
			.setDescription(`A member posted in the bot-net trap channel and was permanently banned.`)
			.addFields(
				{ name: 'Member', value: `<@${message.author.id}>`, inline: true },
				{ name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
				{ name: 'Reason', value: 'Triggered bot-net trap channel.', inline: false },
			)
			.setFooter({ text: `User ID: ${message.author.id}` });

		try {
			await auditLogChannel.send({ embeds: [embed] });
		} catch (error) {
			console.error('Failed to send bot-net audit log:', error);
		}
	},
};
