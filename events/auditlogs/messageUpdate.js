const { Events, EmbedBuilder, cleanCodeBlockContent, codeBlock } = require('discord.js');
const { format } = require('../../functions/helpers/utils.js');

module.exports = {
	name: Events.MessageUpdate,
	runType: 'infinity',
	async execute(client, oldMessage, newMessage) {
		try {
			// Checks
			if (newMessage.author?.bot) return;
			if (newMessage.content?.toString() === oldMessage.content?.toString()) return;
			if (!oldMessage.content && !newMessage.content) return;

			// Get guild settings
			const settings = await client.getGuild(newMessage.guild);
			if (!settings || settings.auditLogId === null) return;

			// Fetch audit log channel
			const auditLogChannel = newMessage.guild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			// Format messages (cap at 900 chars to avoid embed field limit)
			const oldMsg = oldMessage.content?.length > 900 ? format(oldMessage.content, 900) : (oldMessage.content || 'Empty');
			const newMsg = newMessage.content?.length > 900 ? format(newMessage.content, 900) : (newMessage.content || 'Empty');

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.warning)
				.setTitle('Message Edited')
				.setAuthor({ name: `${newMessage.author.tag} (${newMessage.author.id})`, iconURL: newMessage.author.displayAvatarURL() })
				.setThumbnail(newMessage.author.displayAvatarURL())
				.setFooter({ text: `Message ID: ${newMessage.id}` })
				.setTimestamp()
				.addFields(
					{ name: 'Channel', value: newMessage.channel.url, inline: false },
				{ name: 'Author', value: `<@${newMessage.author.id}>`, inline: false },
				{ name: 'Jump to Message', value: `[Click here](${newMessage.url})`, inline: false },
					{ name: 'Before', value: codeBlock(cleanCodeBlockContent(oldMsg)), inline: false },
					{ name: 'After', value: codeBlock(cleanCodeBlockContent(newMsg)), inline: false }
				);

			// Handle removed images/attachments
			if (oldMessage.attachments.size > newMessage.attachments.size) {
				const removedImages = [];
				const removedFiles = [];

				oldMessage.attachments.forEach((attach) => {
					if (!newMessage.attachments.has(attach.id)) {
						const isImage = attach.contentType?.startsWith('image/');
						if (isImage) {
							removedImages.push(`[${attach.name}](${attach.url})`);
						} else {
							removedFiles.push(`[${attach.name}](${attach.url})`);
						}
					}
				});

				if (removedImages.length) embed.addFields({ name: `Images Removed (${removedImages.length})`, value: removedImages.join('\n'), inline: false });
				if (removedFiles.length) embed.addFields({ name: `Attachments Removed (${removedFiles.length})`, value: removedFiles.join('\n'), inline: false });
			}

			// Handle added images/attachments
			if (newMessage.attachments.size > oldMessage.attachments.size) {
				const addedImages = [];
				const addedFiles = [];

				newMessage.attachments.forEach((attach) => {
					if (!oldMessage.attachments.has(attach.id)) {
						const isImage = attach.contentType?.startsWith('image/');
						if (isImage) {
							addedImages.push(`[${attach.name}](${attach.url})`);
							if (!embed.data.image) embed.setImage(attach.url);
						} else {
							addedFiles.push(`[${attach.name}](${attach.url})`);
						}
					}
				});

				if (addedImages.length) embed.addFields({ name: `Images Added (${addedImages.length})`, value: addedImages.join('\n'), inline: false });
				if (addedFiles.length) embed.addFields({ name: `Attachments Added (${addedFiles.length})`, value: addedFiles.join('\n'), inline: false });
			}

			// Handle Stickers (removed)
			if (oldMessage.stickers?.size > newMessage.stickers?.size) {
				const removed = [];
				oldMessage.stickers.forEach((s) => {
					if (!newMessage.stickers?.has(s.id)) removed.push(`${s.name} (\`${s.id}\`)`);
				});
				if (removed.length) embed.addFields({ name: 'Stickers Removed', value: removed.join('\n'), inline: false });
			}

			// Handle Stickers (added)
			if (newMessage.stickers?.size > oldMessage.stickers?.size) {
				const added = [];
				newMessage.stickers.forEach((s) => {
					if (!oldMessage.stickers?.has(s.id)) added.push(`${s.name} (\`${s.id}\`)`);
				});
				if (added.length) embed.addFields({ name: 'Stickers Added', value: added.join('\n'), inline: false });
			}

			// Send message
			try {
				await auditLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send message update audit log:', err);
			}
		} catch (err) {
			console.error('Error in messageUpdate event:', err);
		}
	},
};
