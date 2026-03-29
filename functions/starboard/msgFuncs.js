async function getReplies(message) {
	if (!message) throw new Error('Invalid or no message provided.');

	// Check if theres a message reference
	let referenceMessage = null;
	let error = null;
	if (message.reference) {
		referenceMessage = await message.channel.messages.fetch(message.reference.messageId).catch((e) => {
			referenceMessage = null;
			error = e;
		});
	}
	// Combine Data
	const messageData = { message: message, reference: referenceMessage, error };
	// Send it off
	return messageData;
}

function truncateText(value, maxLength) {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed.length) return null;
	if (trimmed.length <= maxLength) return trimmed;
	return `${trimmed.slice(0, maxLength - 3)}...`;
}

function getForwardedSnapshot(message) {
	const snapshots = message?.messageSnapshots;
	if (!snapshots) return null;
	if (typeof snapshots.first === 'function') return snapshots.first();
	if (Array.isArray(snapshots)) return snapshots[0] || null;
	if (typeof snapshots.values === 'function') {
		const iterator = snapshots.values();
		return iterator.next().value || null;
	}
	return null;
}

function toEmbedArray(sourceEmbeds) {
	if (!sourceEmbeds) return [];
	if (Array.isArray(sourceEmbeds)) return sourceEmbeds;
	if (typeof sourceEmbeds.values === 'function') return [...sourceEmbeds.values()];
	return [];
}

function toAttachmentArray(sourceAttachments) {
	if (!sourceAttachments) return [];
	if (Array.isArray(sourceAttachments)) return sourceAttachments;
	if (typeof sourceAttachments.values === 'function') return [...sourceAttachments.values()];
	return [];
}

async function buildStarEmbed(message, authorName = 'PLACEHOLDER', embedColor = '1e1f22') {
	if (!message) throw new Error('Invalid or no message provided.');
	const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
	const embeds = [];
	const attachments = [];
	const snapshot = getForwardedSnapshot(message);
	const messageUrl = message.url || null;
	const messageTimestamp = message.createdAt || new Date();
	const messageContent = truncateText(message.content, 4096);
	const snapshotContent = truncateText(snapshot?.content, 4096);
	const sourceContent = messageContent || snapshotContent;
	const sourceEmbeds = toEmbedArray(message.embeds?.length ? message.embeds : snapshot?.embeds);
	const sourceAttachments = toAttachmentArray(message.attachments?.size ? message.attachments : snapshot?.attachments);
	const avatarURL = message.member?.displayAvatarURL?.() || message.author?.displayAvatarURL?.() || null;
	const authorData = avatarURL ? { iconURL: avatarURL, name: authorName } : { name: authorName };

	// Attachments
	if (sourceAttachments.length) {
		for (const attach of sourceAttachments) {
			if (!attach?.url) continue;
			const builtEmbed = new EmbedBuilder()
				.setColor(embedColor)
				.setImage(attach.url)
				.setTimestamp(messageTimestamp)
				.setAuthor(authorData);
			if (messageUrl) builtEmbed.setURL(messageUrl);
			if (sourceContent) builtEmbed.setDescription(sourceContent);
			embeds.push(builtEmbed);
			if (attach.contentType?.includes('video')) {
				attachments.push(new AttachmentBuilder(attach.url));
			}
		}
	}
	// Embeds
	else if (sourceEmbeds.length) {
		let imageSet = false;
		for (const embed of sourceEmbeds) {
			const builtEmbed = new EmbedBuilder().setColor(embedColor).setTimestamp(messageTimestamp).setAuthor(authorData);
			const title = truncateText(embed?.title || embed?.data?.title, 256);
			const url = embed?.url || embed?.data?.url || messageUrl;
			const description = truncateText(embed?.description || embed?.data?.description || sourceContent, 4096);
			const imageUrl = embed?.image?.url || embed?.data?.image?.url || null;
			const thumbnailUrl = embed?.thumbnail?.url || embed?.data?.thumbnail?.url || null;

			if (title) builtEmbed.setTitle(title);
			if (url) builtEmbed.setURL(url);
			if (description) builtEmbed.setDescription(description);
			if (imageUrl) builtEmbed.setImage(imageUrl);
			if (thumbnailUrl && !imageUrl) {
				builtEmbed.setImage(thumbnailUrl);
				imageSet = true;
			}
			if (thumbnailUrl && !imageSet) builtEmbed.setThumbnail(thumbnailUrl);
			embeds.push(builtEmbed);
		}
	}
	// Text-based
	else {
		const builtEmbed = new EmbedBuilder()
			.setColor(embedColor)
			.setTimestamp(messageTimestamp)
			.setAuthor(authorData);
		if (messageUrl) builtEmbed.setURL(messageUrl);
		builtEmbed.setDescription(sourceContent || 'Forwarded message content is unavailable.');
		embeds.push(builtEmbed);
	}

	if (!embeds.length) {
		const fallbackEmbed = new EmbedBuilder().setColor(embedColor).setTimestamp(messageTimestamp).setAuthor(authorData);
		if (messageUrl) fallbackEmbed.setURL(messageUrl);
		fallbackEmbed.setDescription(sourceContent || 'Forwarded message content is unavailable.');
		embeds.push(fallbackEmbed);
	}

	return { embeds, attachments };
}

module.exports = {
	getReplies,
	buildStarEmbed,
};
