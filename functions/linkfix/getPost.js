const { URLRegexes } = require('./constants');
const { TwitterApi } = require('twitter-api-v2');
const appLogin = new TwitterApi({
	appKey: process.env.TWITTER_API_KEY,
	appSecret: process.env.TWITTER_API_SECRET,
	accessToken: process.env.TWITTER_ACCESS_TOKEN,
	accessSecret: process.env.TWITTER_ACCESS_SECRET,
});


async function getPost(tweetID) {
	const appClient = await appLogin.appLogin();
	const tweetData = await appClient.v1.singleTweet(tweetID);
	// const tweetData = await appClient.v1.verifyCredentials();
	return tweetData;
}

module.exports = {
	getPost,
};
