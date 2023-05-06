module.exports = (channel) => {
	const channelType = channel.type;
	if (channelType === 0) return 'Text Channel';
	if (channelType === 2) return 'Voice Channel';
	if (channelType === 4) return 'Category';
	if (channelType === 5) return 'News Channel';
	if (channelType === 13) return 'Stage Channel';
	if (channelType === 15) return 'Forum';
	return 'Unknown Channel';
};
