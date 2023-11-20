const { ViiEmojis } = require('../../images/icons/emojis');

const pb = {
	le: ViiEmojis['LE'],
	me: ViiEmojis['ME'],
	re: ViiEmojis['RE'],
	lf: ViiEmojis['LF'],
	mf: ViiEmojis['MF'],
	rf: ViiEmojis['RF'],
};

function formatVotes(upvotes = [], downvotes = []) {
	const totalVotes = upvotes.length + downvotes.length;

	const upPercentage = (upvotes.length / totalVotes) * 100 || 0;
	const downPercentage = (downvotes.length / totalVotes) * 100 || 0;

	return `👍 ${upvotes.length} upvotes (${upPercentage.toFixed(1)}%) • 👎 ${downvotes.length} downvotes (${downPercentage.toFixed(1)}%)`;
}

function formatEmojiBar(upvotes = [], downvotes = []) {
	const totalVotes = upvotes.length + downvotes.length;
	const progressBarLength = 14;
	const filledSquares = Math.round((upvotes.length / totalVotes) * progressBarLength) || 0;
	const emptySquares = progressBarLength - filledSquares || 0;

	if (!filledSquares && !emptySquares) {
		emptySquares = progressBarLength;
	}

	const progressBar = (filledSquares ? pb.lf : pb.le) + (pb.mf.repeat(filledSquares) + pb.me.repeat(emptySquares)) + (filledSquares === progressBarLength ? pb.rf : pb.re);

	return progressBar;
}

module.exports = { formatVotes, formatEmojiBar };
