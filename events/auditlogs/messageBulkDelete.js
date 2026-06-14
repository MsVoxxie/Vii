const { Events, AuditLogEvent, EmbedBuilder, cleanCodeBlockContent } = require('discord.js');
const getAuditLogs = require('../../functions/audithelpers/getAuditLogs.js');

const FIELD_VALUE_LIMIT = 1024;
const EMBED_FIELD_LIMIT = 25;
const EMBED_CHAR_LIMIT = 5800;
const FIRST_PAGE_RESERVED_FIELDS = 3;

function splitText(text, maxLength) {
	const chunks = [];
	let remaining = text;

	while (remaining.length > maxLength) {
		let sliceIndex = remaining.lastIndexOf('\n', maxLength);
		if (sliceIndex < maxLength * 0.6) sliceIndex = remaining.lastIndexOf(' ', maxLength);
		if (sliceIndex <= 0) sliceIndex = maxLength;

		chunks.push(remaining.slice(0, sliceIndex).trim());
		remaining = remaining.slice(sliceIndex).trim();
	}

	if (remaining.length) chunks.push(remaining);
	return chunks;
}

function formatAttachmentList(message) {
	const images = [];
	const files = [];

	if (!message.attachments?.size) {
		return { images, files, previewImage: null };
	}

	let previewImage = null;
	message.attachments.forEach((attach) => {
		const isImage = attach.contentType?.startsWith('image/');
		if (isImage) {
			images.push(`[${attach.name}](${attach.url})`);
			if (!previewImage) previewImage = attach.url;
		} else {
			files.push(`[${attach.name}](${attach.url})`);
		}
	});

	return { images, files, previewImage };
}

function buildMessageSection(client, message, messageIndex, totalMessages) {
	const authorTag = message.author?.tag || message.author?.username || 'Unknown';
	const authorId = message.author?.id || 'Unknown';
	const sentAt = message.createdTimestamp ? client.relTimestamp(message.createdTimestamp) : 'Unknown';
	const jumpLink = message.url || 'Unknown';
	const content = cleanCodeBlockContent(message.content || 'No text content');
	const { images, files, previewImage } = formatAttachmentList(message);

	const lines = [];
	lines.push(`Author: <@${authorId}>`);
	lines.push(`Sent: ${sentAt}`);
	lines.push(`Content: ${content}`);

	if (images.length) lines.push(`Images:\n${images.join('\n')}`);
	if (files.length) lines.push(`Attachments:\n${files.join('\n')}`);
	if (message.stickers?.size) {
		const stickers = message.stickers.map((sticker) => `${sticker.name} (\`${sticker.id}\`)`).join('\n');
		lines.push(`Stickers (${message.stickers.size}):\n${stickers}`);
	}
	if (message.reactions?.cache?.size) {
		const reactions = message.reactions.cache.map((reaction) => `${reaction.emoji.name || reaction.emoji.toString()} ×${reaction.count}`).join('  ');
		lines.push(`Reactions: ${reactions}`);
	}

	return {
		label: `Message ${messageIndex + 1}/${totalMessages} - ${authorTag}`,
		text: lines.join('\n'),
		previewImage,
	};
}

function createPageEmbed(client, auditInfo, pageIndex, totalPages, messageCount) {
	const embed = new EmbedBuilder()
		.setColor(client.colors.error)
		.setTitle(pageIndex === 0 ? 'Bulk Messages Deleted' : 'Bulk Messages Deleted - Continued')
		.setTimestamp();

	if (auditInfo.executor) {
		embed.setAuthor({
			name: `Deleted By: ${auditInfo.executor.tag || auditInfo.executor.username || auditInfo.executor.id}`,
			iconURL: auditInfo.executor.displayAvatarURL?.(),
		});
	}

	if (pageIndex === 0) {
		embed.addFields(
			{ name: 'Channel', value: auditInfo.channelName || 'Unknown', inline: false },
			{ name: 'Deleted By', value: auditInfo.executor ? `<@${auditInfo.executor.id}>` : 'Unknown', inline: false },
			{ name: 'Messages Deleted', value: `${messageCount}`, inline: false },
		);
	}

	embed.setFooter({ text: `Page ${pageIndex + 1}/${totalPages}${auditInfo.channelName ? ` • Channel: ${auditInfo.channelName}` : ''}` });
	return embed;
}

function estimateEmbedSize(embed) {
	let size = (embed.data.title || '').length + (embed.data.description || '').length;
	if (embed.data.footer?.text) size += embed.data.footer.text.length;
	if (embed.data.author?.name) size += embed.data.author.name.length;
	for (const field of embed.data.fields || []) {
		size += (field.name || '').length + (field.value || '').length;
	}
	return size;
}

function finalizePage(pages, currentPage) {
	if (currentPage.fields.length) pages.push(currentPage);
}

module.exports = {
	name: Events.MessageBulkDelete,
	runType: 'infinity',
	async execute(client, messages) {
		try {
			if (!messages?.size) return;

			const messageArray = [...messages.values()].filter(Boolean).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
			if (!messageArray.length) return;

			const firstMessage = messageArray[0];
			if (!firstMessage?.guild) return;

			const settings = await client.getGuild(firstMessage.guild);
			if (!settings || settings.auditLogId === null) return;

			const auditLogChannel = firstMessage.guild.channels.cache.get(settings.auditLogId);
			if (!auditLogChannel) return;

			let auditLog = await getAuditLogs(firstMessage.guild, AuditLogEvent.MessageBulkDelete);
			let { executor, createdTimestamp } = auditLog || {};
			if (!executor || !createdTimestamp || Date.now() - createdTimestamp > 5000) executor = null;

			const auditInfo = {
				executor,
				channelName: firstMessage.channel?.name ? `#${firstMessage.channel.name}` : 'Unknown',
			};

			const pages = [];
			let currentPage = {
				embed: createPageEmbed(client, auditInfo, 0, 1, messageArray.length),
				fields: [],
				size: estimateEmbedSize(createPageEmbed(client, auditInfo, 0, 1, messageArray.length)),
			};

			const getPageFieldLimit = (pageIndex) => (pageIndex === 0 ? EMBED_FIELD_LIMIT - FIRST_PAGE_RESERVED_FIELDS : EMBED_FIELD_LIMIT);

			const appendPage = () => {
				if (!currentPage.fields.length) return;
				pages.push(currentPage);
			};

			for (let messageIndex = 0; messageIndex < messageArray.length; messageIndex++) {
				const message = messageArray[messageIndex];
				const section = buildMessageSection(client, message, messageIndex, messageArray.length);
				const sectionChunks = splitText(section.text, FIELD_VALUE_LIMIT - 20).map((chunk, chunkIndex) => ({
					name: chunkIndex === 0 ? section.label : `${section.label} (cont.)`,
					value: chunk,
					previewImage: section.previewImage,
				}));

				for (const field of sectionChunks) {
					const fieldSize = field.name.length + field.value.length;
					const needsNewPage = currentPage.fields.length >= getPageFieldLimit(pages.length) || currentPage.size + fieldSize > EMBED_CHAR_LIMIT;

					if (needsNewPage) {
						appendPage();
						currentPage = {
							embed: createPageEmbed(client, auditInfo, pages.length, 1, messageArray.length),
							fields: [],
							size: estimateEmbedSize(createPageEmbed(client, auditInfo, pages.length, 1, messageArray.length)),
						};
					}

					currentPage.fields.push(field);
					currentPage.size += fieldSize;

					if (field.previewImage && !currentPage.embed.data.image) {
						currentPage.embed.setImage(field.previewImage);
					}
				}
			}

			appendPage();

			if (!pages.length) return;
			const totalPages = pages.length;
			for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
				const page = pages[pageIndex];
				page.embed.setFooter({ text: `Page ${pageIndex + 1}/${totalPages}${auditInfo.channelName ? ` • Channel: ${auditInfo.channelName}` : ''}` });
				page.fields.forEach((field) => page.embed.addFields({ name: field.name, value: field.value, inline: false }));
			}

			for (let index = 0; index < pages.length; index += 10) {
				const batch = pages.slice(index, index + 10).map((page) => page.embed);
				await auditLogChannel.send({ embeds: batch });
			}
		} catch (err) {
			console.error('Error in messageBulkDelete event:', err);
		}
	},
};
