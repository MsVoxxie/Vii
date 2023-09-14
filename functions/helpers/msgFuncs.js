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
	const messageData = {
		message: message,
		reference: referenceMessage,
		error,
	};

	// Send it off
	return messageData;
}

module.exports = {
	getReplies,
};
