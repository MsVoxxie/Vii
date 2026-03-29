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
			if (!oldMessage.content || !newMessage.content) return;

			// Get guild settings
			const settings = await client.getGuild(newMessage.guild);
			if (!settings || settings.auditLogId === null) return;

			// Fetch audit log channel
			const auditLogChannel = newMessage.guild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			// Format messages
			const oldMsg = oldMessage.content?.length > 500 ? format(oldMessage.content, 500) : oldMessage.content;
			const newMsg = newMessage.content?.length > 500 ? format(newMessage.content, 490) : newMessage.content;

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Message Updated')
				.setDescription(
					`Old Message${codeBlock(cleanCodeBlockContent(oldMsg || 'Message is Empty.'))}\nNew Message${codeBlock(cleanCodeBlockContent(newMsg || 'Message is Empty.'))}`
				)
				.addFields(
					{ name: 'Channel Name', value: newMessage.channel.url, inline: true },
					{ name: 'Message Author', value: `<@${newMessage.member.id}>`, inline: true },
					{ name: 'Updated', value: client.relTimestamp(Date.now()), inline: true }
				)
				.setThumbnail(newMessage.author.displayAvatarURL())
				.setFooter({ text: `Message ID: ${newMessage.id}` });

			// Handle Images/Attachments
			let removedImages = '';
			let removedAttachments = '';
			let addedImages = '';
			let addedAttachments = '';

			if (oldMessage.attachments.size > newMessage.attachments.size) {
				oldMessage.attachments.forEach((attach) => {
					if (!newMessage.attachments.has(attach.id)) {
						const isImage = attach.contentType?.startsWith('image/');
						if (isImage) {
							removedImages += `[${attach.name}](${attach.url})\n`;
						} else {
							removedAttachments += `[${attach.name}](${attach.url})\n`;
						}
					}
				});

				if (removedImages) {
					embed.addFields({ name: 'Removed Images', value: removedImages, inline: false });
				}
				if (removedAttachments) {
					embed.addFields({ name: 'Removed Attachments', value: removedAttachments, inline: false });
				}
			}

			if (newMessage.attachments.size > oldMessage.attachments.size) {
				newMessage.attachments.forEach((attach) => {
					if (!oldMessage.attachments.has(attach.id)) {
						const isImage = attach.contentType?.startsWith('image/');
						if (isImage) {
							addedImages += `[${attach.name}](${attach.url})\n`;
							if (!embed.data.image && !embed.data.thumbnail) {
								embed.setImage(attach.url);
							}
						} else {
							addedAttachments += `[${attach.name}](${attach.url})\n`;
						}
					}
				});

				if (addedImages) {
					embed.addFields({ name: 'Added Images', value: addedImages, inline: false });
				}
				if (addedAttachments) {
					embed.addFields({ name: 'Added Attachments', value: addedAttachments, inline: false });
				}
			}

			// Handle Stickers
			let removedStickers = '';
			let addedStickers = '';

			if (oldMessage.stickers?.size > newMessage.stickers?.size) {
				oldMessage.stickers.forEach((sticker) => {
					if (!newMessage.stickers?.has(sticker.id)) {
						removedStickers += `${sticker.name} (\`${sticker.id}\`)\n`;
					}
				});
				if (removedStickers) {
					embed.addFields({ name: 'Removed Stickers', value: removedStickers, inline: false });
				}
			}

			if (newMessage.stickers?.size > oldMessage.stickers?.size) {
				newMessage.stickers.forEach((sticker) => {
					if (!oldMessage.stickers?.has(sticker.id)) {
						addedStickers += `${sticker.name} (\`${sticker.id}\`)\n`;
					}
				});
				if (addedStickers) {
					embed.addFields({ name: 'Added Stickers', value: addedStickers, inline: false });
				}
			}

			// Handle Reactions/Emojis
			let removedReactions = '';
			let addedReactions = '';

			if (oldMessage.reactions?.cache?.size !== newMessage.reactions?.cache?.size) {
				oldMessage.reactions?.cache?.forEach((reaction) => {
					if (!newMessage.reactions?.cache?.has(reaction.emoji.id || reaction.emoji.name)) {
						const emoji = reaction.emoji.name || reaction.emoji.toString();
						removedReactions += `${emoji} (${reaction.count})\n`;
					}
				});

				newMessage.reactions?.cache?.forEach((reaction) => {
					if (!oldMessage.reactions?.cache?.has(reaction.emoji.id || reaction.emoji.name)) {
						const emoji = reaction.emoji.name || reaction.emoji.toString();
						addedReactions += `${emoji} (${reaction.count})\n`;
					}
				});

				if (removedReactions) {
					embed.addFields({ name: 'Removed Reactions', value: removedReactions, inline: false });
				}
				if (addedReactions) {
					embed.addFields({ name: 'Added Reactions', value: addedReactions, inline: false });
				}
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
