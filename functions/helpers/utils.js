function format(text, number) {
	text = text.slice(0, number);
	return text + '...';
}

module.exports = {
	format,
};
