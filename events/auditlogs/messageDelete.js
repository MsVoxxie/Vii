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
