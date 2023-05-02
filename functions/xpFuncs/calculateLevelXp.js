module.exports = (level) => {
	const levelXp = Math.floor(50 * (level * level) + 50 * level + 100);
	return levelXp;
};
