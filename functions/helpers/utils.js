function format(text, number) {
	text = text.slice(0, number);
	return text + '...';
}

function embedHasContent(embed) {
	const image = embed?.image;
	const thumbnail = embed?.thumbnail;
	const description = embed?.description;

	const hasImage = image && image.url;
	const hasThumbnail = thumbnail && thumbnail.url;
	const hasDescription = description && description.length > 0;

	return {
		hasImage,
		hasThumbnail,
		hasDescription,
	};
}

module.exports = {
	format,
	embedHasContent,
};
