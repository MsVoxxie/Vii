const { Events, EmbedBuilder, cleanCodeBlockContent, codeBlock } = require('discord.js');
const { format } = require('../../functions/helpers/utils.js');

module.exports = {
	name: Events.MessageUpdate,
	runType: 'infinity',
	async execute(client, oldMessage, newMessage) {
		// Checks
		if (newMessage.author?.bot) return;
		if (newMessage.content?.toString() === oldMessage.content?.toString()) return;
		if (!oldMessage.content || !newMessage.content) return;

		// Get guild settings
		const settings = await client.getGuild(newMessage.guild);
		if (settings.auditLogId === null) return;

		// Fetch audit log channel
		const auditLogChannel = await newMessage.guild.channels.cache.get(settings.auditLogId);
		if (!auditLogChannel) return;

		// Format messages
		const oldMsg = oldMessage.content?.length > 500 ? format(oldMessage.content, 500) : oldMessage.content;
		const newMsg = newMessage.content?.length > 500 ? format(newMessage.content, 490) : newMessage.content;

		// Build Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Message Updated')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(
				`Old Message${codeBlock(cleanCodeBlockContent(oldMsg || 'Message is Empty.'))}\nNew Message${codeBlock(cleanCodeBlockContent(newMsg || 'Message is Empty.'))}`
			)
			.addFields(
				{ name: 'Channel Name', value: newMessage.channel.url, inline: true },
				{ name: 'Message Author', value: `<@${newMessage.member.id}>`, inline: true },
				{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true }
			);

		// Files
		let files = '';
		if (oldMessage.attachments.size > newMessage.attachments.size) {
			oldMessage.attachments.forEach((attach) => {
				files += `[${attach.name}](${attach.url}) [**Alt Link**](${attach.proxyURL})\n`;
			});

			embed.addFields({
				name: 'Removed Attachments',
				value: files,
			});
		}

		if (oldMessage.attachments.size < newMessage.attachments.size) {
			newMessage.attachments.forEach((attach) => {
				files += `[${attach.name}](${attach.url}) **›** [**Alt Link**](${attach.proxyURL})\n`;
			});

			embed.addFields({
				name: 'Added Attachments',
				value: files,
			});
		}

		// Send message
		await auditLogChannel.send({ embeds: [embed] });
	},
};
