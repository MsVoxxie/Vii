const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { pinnedMessageData } = require('../../models/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pinmsg')
		.setDescription('Pinned Message configuration')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('add')
				.setDescription('Create a new pinned message for this channel')
				.addStringOption((option) => option.setName('message_link').setDescription('The message link to pin to the channel.').setRequired(true))
				.addNumberOption((option) => option.setName('threshhold').setDescription('How many messages until the pinned message is resent.').setRequired(true))
				.addChannelOption((option) => option.setName('channel').setDescription('The channel to pin this message in (Blank for current channel).').setRequired(false))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName('remove')
				.setDescription('Remove a pinned message from the channel')
				.addStringOption((option) => option.setName('message_link').setDescription('The message link to pin to the channel.').setRequired(true))
				.addChannelOption((option) => option.setName('channel').setDescription('The channel to pin this message in (Blank for current channel).').setRequired(false))
		),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		const sub = interaction.options.getSubcommand();
		await interaction.deferReply({ ephemeral: true });

		if (sub === 'add') {
			const messageLink = interaction.options.getString('message_link');
			const threshold = interaction.options.getNumber('threshhold');
			const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

			if (!messageLink || !messageLink.startsWith('https://discord.com/channels/'))
				return interaction.followUp({ content: 'The message link you provided is not valid.', flags: MessageFlags.Ephemeral });
			if (!Number.isInteger(threshold) || threshold < 1)
				return interaction.followUp({ content: 'Please provide a valid threshold (1 or greater).', flags: MessageFlags.Ephemeral });

			// Parse link: https://discord.com/channels/<guildId>/<channelId>/<messageId>
			const parts = messageLink.split('/');
			const linkGuildId = parts[4];
			const linkChannelId = parts[5];
			const linkMessageId = parts[6];

			if (linkGuildId !== interaction.guild.id)
				return interaction.followUp({ content: 'That message is not from this server.', flags: MessageFlags.Ephemeral });

			try {
				// Verify we can fetch the source message
				const srcChannel = await interaction.guild.channels.fetch(linkChannelId);
				const fetchedMessage = await srcChannel.messages.fetch(linkMessageId, { force: true });

				// Create DB entry (upsert-like behavior to avoid dupes per target channel + message)
				const created = await pinnedMessageData
					.findOneAndUpdate(
						{ guildId: interaction.guild.id, targetChannelId: targetChannel.id, messageId: fetchedMessage.id },
						{ $setOnInsert: { counter: 0, lastForwardedAt: null }, $set: { sourceChannelId: srcChannel.id, threshold: threshold } },
						{ new: true, upsert: true }
					);

				const embed = new EmbedBuilder()
					.setTitle('Pinned Message Added')
					.setDescription(
						`I will forward this message to ${targetChannel} every ${threshold} messages in that channel to keep it visible.\n[Jump to Source Message](${fetchedMessage.url})`
					)
					.addFields(
						{ name: 'Target Channel', value: `${targetChannel}`, inline: true },
						{ name: 'Threshold', value: `${threshold}`, inline: true }
					)
					.setColor(client.colors?.vii ?? 0x2b2d31)
					.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

				return interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
			} catch (e) {
				return interaction.followUp({ content: 'I could not fetch that message. Please check my permissions and the link.', flags: MessageFlags.Ephemeral });
			}
		}

		if (sub === 'remove') {
			const messageLink = interaction.options.getString('message_link');
			const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

			if (!messageLink || !messageLink.startsWith('https://discord.com/channels/'))
				return interaction.followUp({ content: 'The message link you provided is not valid.', flags: MessageFlags.Ephemeral });

			const parts = messageLink.split('/');
			const linkGuildId = parts[4];
			const linkChannelId = parts[5];
			const linkMessageId = parts[6];

			if (linkGuildId !== interaction.guild.id)
				return interaction.followUp({ content: 'That message is not from this server.', flags: MessageFlags.Ephemeral });

			// We stored by target channel + message id
			const found = await pinnedMessageData.findOneAndDelete({ guildId: interaction.guild.id, targetChannelId: targetChannel.id, messageId: linkMessageId });
			if (!found)
				return interaction.followUp({ content: 'No pinned-message config found for that message in this channel.', flags: MessageFlags.Ephemeral });

			const embed = new EmbedBuilder()
				.setTitle('Pinned Message Removed')
				.setDescription(`Removed the pinned-message config for ${targetChannel}.`)
				.setColor(client.colors?.vii ?? 0x2b2d31)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			return interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
		}
	},
};
