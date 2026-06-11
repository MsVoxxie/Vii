const { Events, AuditLogEvent, EmbedBuilder, cleanCodeBlockContent, codeBlock } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');
const { roleAssignmentData } = require('../../models/index.js');

module.exports = {
	name: Events.MessageDelete,
	runType: 'infinity',
	async execute(client, message) {
		try {
			// If Partial, give up
			if (message.partial) return;
			if (message.author.bot) return;

			// If the message ID relates to a role reaction, delete the entry from the database.
			try {
				const roles = await roleAssignmentData.find({ messageId: message.id });
				if (roles?.length > 0) {
					// Loop through each role and delete it.
					for (const role of roles) {
						await role.deleteOne();
					}
				}
			} catch (error) {
				console.error('Error deleting role assignment data:', error);
			}

			// Get guild settings
			const settings = await client.getGuild(message.guild);
			if (!settings || settings.auditLogId === null) return;

			// Fetch audit log channel
			const auditLogChannel = message.guild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			// Get information — if no audit log or it's stale, assume self-deletion
			let auditLog = await getAuditLogs(message.guild, AuditLogEvent.MessageDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) {
				executor = message.author;
			}

			const isSelfDelete = executor.id === message.author.id;

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.error)
				.setTitle('Message Deleted')
				.setAuthor({ name: `${message.author.tag} (${message.author.id})`, iconURL: message.author.displayAvatarURL() })
				.setDescription(`${codeBlock(cleanCodeBlockContent(message.content || 'No text content'))}`)
				.addFields(
					{ name: 'Channel', value: message.channel.url, inline: false },
				{ name: 'Message Author', value: `<@${message.author.id}>`, inline: false },
				{ name: 'Deleted By', value: isSelfDelete ? `<@${message.author.id}> (self)` : `<@${executor.id}>`, inline: false },
				{ name: 'Message Sent', value: client.relTimestamp(message.createdTimestamp), inline: false },
					{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: false }
				)
				.setFooter({ text: `Message ID: ${message.id}` })
				.setTimestamp();

			// Handle Images/Attachments — attempt to re-upload before CDN URL expires
			const files = [];
			let firstImageName = null;

			if (message.attachments.size) {
				const imageLinks = [];
				const fileLinks = [];

				for (const [, attach] of message.attachments) {
					const isImage = attach.contentType?.startsWith('image/');

					// Attempt to re-upload the file while the CDN URL is still valid
					try {
						const response = await fetch(attach.proxyURL);
						if (response.ok) {
							const buffer = Buffer.from(await response.arrayBuffer());
							files.push({ attachment: buffer, name: attach.name });
							if (isImage && !firstImageName) firstImageName = attach.name;
						}
					} catch (err) {
						// URL already expired — log link only
					}

					if (isImage) {
						imageLinks.push(`[${attach.name}](${attach.url})`);
					} else {
						fileLinks.push(`[${attach.name}](${attach.url})`);
					}
				}

				if (imageLinks.length) embed.addFields({ name: `Images (${imageLinks.length})`, value: imageLinks.join('\n'), inline: false });
				if (fileLinks.length) embed.addFields({ name: `Attachments (${fileLinks.length})`, value: fileLinks.join('\n'), inline: false });

				// Display the first re-uploaded image in the embed
				if (firstImageName) embed.setImage(`attachment://${firstImageName}`);
			}

			// Handle Stickers
			if (message.stickers?.size) {
				const stickers = message.stickers.map((s) => `${s.name} (\`${s.id}\`)`).join('\n');
				embed.addFields({ name: `Stickers (${message.stickers.size})`, value: stickers, inline: false });
			}

			// Handle Embeds
			if (message.embeds?.length) {
				embed.addFields({ name: 'Embedded Content', value: `${message.embeds.length} embed${message.embeds.length !== 1 ? 's' : ''} (not recoverable)`, inline: false });
			}

			// Handle Reactions
			if (message.reactions?.cache?.size) {
				const reactions = message.reactions.cache.map((r) => `${r.emoji.name} ×${r.count}`).join('  ');
				embed.addFields({ name: 'Reactions at Deletion', value: reactions, inline: false });
			}

			// Send message
			try {
				await auditLogChannel.send({ embeds: [embed], files });
			} catch (err) {
				console.error('Failed to send message delete audit log:', err);
			}
		} catch (err) {
			console.error('Error in messageDelete event:', err);
		}
	},
};


module.exports = {
	name: Events.MessageDelete,
	runType: 'infinity',
	async execute(client, message) {
		try {
			// If Partial, give up
			if (message.partial) return;
			if (message.author.bot) return;

			// If the message ID relates to a role reaction, delete the entry from the database.
			try {
				const roles = await roleAssignmentData.find({ messageId: message.id });
				if (roles?.length > 0) {
					// Loop through each role and delete it.
					for (const role of roles) {
						await role.deleteOne();
					}
				}
			} catch (error) {
				console.error('Error deleting role assignment data:', error);
			}

			// Get guild settings
			const settings = await client.getGuild(message.guild);
			if (!settings || settings.auditLogId === null) return;

			// Fetch audit log channel
			const auditLogChannel = message.guild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			// Get information
			let auditLog = await getAuditLogs(message.guild, AuditLogEvent.MessageDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor) return;

			// Check for time difference, if the returned audit log createdTimestamp is greater than 5 seconds, set executor to message author
			if (!createdTimestamp || Date.now() - createdTimestamp > 5000) {
				executor = message.author;
			}

			// Build Embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Message Deleted')
				.setDescription(`${codeBlock(cleanCodeBlockContent(message.content || 'No content'))}`)
				.addFields(
					{ name: 'Channel Name', value: message.channel.url, inline: true },
					{ name: 'Message Author', value: `<@${message.member.id}>`, inline: true },
					{ name: 'Deleted By', value: `<@${executor.id}>`, inline: true },
					{ name: 'Deleted', value: client.relTimestamp(Date.now()), inline: true }
				);

			// Handle Images/Attachments
			let images = '';
			let attachments = '';
			if (message.attachments.size) {
				message.attachments.forEach((attach) => {
					const isImage = attach.contentType?.startsWith('image/');
					if (isImage) {
						images += `[${attach.name}](${attach.url})\n`;
						if (!embed.data.image && !embed.data.thumbnail) {
							embed.setImage(attach.url);
						}
					} else {
						attachments += `[${attach.name}](${attach.url}) **›** [**Alt Link**](${attach.proxyURL})\n`;
					}
				});

				if (images) {
					embed.addFields({ name: 'Images Deleted', value: images, inline: false });
				}

				if (attachments) {
					embed.addFields({ name: 'Attachments', value: attachments, inline: false });
				}
			}

			// Handle Stickers
			let stickers = '';
			if (message.stickers?.size) {
				message.stickers.forEach((sticker) => {
					stickers += `${sticker.name} (\`${sticker.id}\`)\n`;
				});

				embed.addFields({ name: 'Stickers', value: stickers, inline: false });
			}

			// Handle Reactions/Emojis
			let reactions = '';
			if (message.reactions?.cache?.size) {
				message.reactions.cache.forEach((reaction) => {
					const emoji = reaction.emoji.name || reaction.emoji.toString();
					reactions += `${emoji} (${reaction.count})\n`;
				});

				if (reactions) {
					embed.addFields({ name: 'Reactions', value: reactions, inline: false });
				}
			}

			// Add divider line at the end
			embed.setThumbnail(message.author.displayAvatarURL())
				.setFooter({ text: `Message ID: ${message.id}` });

			// Send message
			try {
				await auditLogChannel.send({ embeds: [embed] });
			} catch (err) {
				console.error('Failed to send message delete audit log:', err);
			}
		} catch (err) {
			console.error('Error in messageDelete event:', err);
		}
	},
};
