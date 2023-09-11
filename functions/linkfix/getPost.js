const { URLRegexes } = require('./constants');
// const { Auth } = require('rettiwt-auth');
const { Rettiwt } = require('rettiwt-api');

const twitClient = new Rettiwt(process.env.TWITTER_API);

async function getPost(tweetID) {
	const tweetData = twitClient.tweet.details(tweetID).then((res) => res);
	return tweetData;
}

module.exports = {
	getPost,
};
